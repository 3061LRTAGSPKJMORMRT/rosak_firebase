import { QueryRef } from "apollo-angular";
import { NzCalendarMode } from "ng-zorro-antd/calendar";
import { Subscription } from "rxjs";

import { formatDate } from "@angular/common";
import {
    Component,
    Inject,
    Input,
    LOCALE_ID,
    OnChanges,
    OnInit,
    SimpleChanges,
} from "@angular/core";

import {
    GetCalendarIncidentListMinResponse,
    GetCalendarIncidentListMinResponseElem,
    GetCalIncidentListMinService,
} from "../services/get-cal-incident-list-min.service";
import { getReadableTimeDifference } from "./event-list.component.util";

const DATE_FORMAT = "yyyy-MM-dd";

export interface CalendarIncidentListItem
    extends GetCalendarIncidentListMinResponseElem {
    duration?: string;
}

interface CalendarFilterMonth {
    date: string;
}
interface CalendarFilterYear {
    startDate: string;
    endDate: string;
}

@Component({
    selector: "insiden-event-list",
    templateUrl: "./event-list.component.html",
    styleUrls: ["./event-list.component.scss"],
})
export class EventListComponent implements OnInit, OnChanges {
    @Input() selectedDate!: Date;
    @Input() calendarMode!: NzCalendarMode;

    showLoading: boolean = true;
    data: CalendarIncidentListItem[] = [];

    gqlSubscription!: Subscription;
    watchQueryOption!: QueryRef<GetCalendarIncidentListMinResponse>;

    constructor(
        private gqlService: GetCalIncidentListMinService,
        @Inject(LOCALE_ID) private locale: string
    ) {
        return;
    }

    mutateResponse(
        input: GetCalendarIncidentListMinResponse
    ): CalendarIncidentListItem[] {
        const data: CalendarIncidentListItem[] = JSON.parse(
            JSON.stringify(input.calendarIncidents)
        );

        data.forEach((calIncident) => {
            if (calIncident.chronologies.length === 0) {
                calIncident.chronologies.push({
                    order: "0",
                    sourceUrl: "",
                    indicator: "blue",
                    datetime: calIncident.startDatetime,
                    content: "Start of incident",
                });

                if (calIncident.endDatetime) {
                    calIncident.chronologies.push({
                        order: "1",
                        sourceUrl: "",
                        indicator: "green",
                        datetime: calIncident.endDatetime,
                        content: "Issue resolved",
                    });
                }
            }

            calIncident.chronologies = calIncident.chronologies.map((c) => {
                return {
                    ...c,
                    content: c.content.split("\r\n").join("<br />"),
                };
            });
            calIncident.chronologies.sort((a, b) => {
                return Number(a.order) - Number(b.order);
            });

            calIncident.brief = calIncident.brief.split("\r\n").join("<br />");

            if (calIncident.endDatetime) {
                calIncident.duration = getReadableTimeDifference(
                    new Date(calIncident.startDatetime),
                    new Date(calIncident.endDatetime)
                );
            }
        });

        return data;
    }

    getFilter(): CalendarFilterMonth | CalendarFilterYear {
        if (this.calendarMode === "month") {
            return {
                date: formatDate(this.selectedDate, DATE_FORMAT, this.locale),
            };
        } else if (this.calendarMode === "year") {
            const firstDay = new Date(
                this.selectedDate.getFullYear(),
                this.selectedDate.getMonth(),
                1
            );
            const lastDay = new Date(
                this.selectedDate.getFullYear(),
                this.selectedDate.getMonth() + 1,
                0
            );
            return {
                startDate: formatDate(firstDay, DATE_FORMAT, this.locale),
                endDate: formatDate(lastDay, DATE_FORMAT, this.locale),
            };
        } else {
            throw new Error("Invalid calendar mode");
        }
    }

    ngOnInit(): void {
        this.showLoading = true;

        this.watchQueryOption = this.gqlService.watch({
            filters: this.getFilter(),
        });

        this.gqlSubscription = this.watchQueryOption.valueChanges.subscribe(
            ({ data, loading }) => {
                this.showLoading = loading;
                this.data = this.mutateResponse(data);
            }
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        this.showLoading = true;

        this.watchQueryOption
            .fetchMore({
                variables: {
                    filters: this.getFilter(),
                },
            })
            .then(({ data, loading }) => {
                this.showLoading = loading;

                this.data = this.mutateResponse(data);
            });
    }
}
