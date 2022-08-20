import { TableWidthConfig } from "ng-devui";

import { Component, Input, OnInit } from "@angular/core";

@Component({
    selector: "app-inline-history",
    templateUrl: "./inline-history.component.html",
    styleUrls: ["./inline-history.component.scss"],
})
export class InlineHistoryComponent implements OnInit {
    @Input() vehicleId: string = "1";

    dataSource = [
        {
            spottingDate: "2022-08-07",
            status: "IN_SERVICE",
            type: "JUST_SPOTTING",
            notes: "",
        },
    ];

    dataTableOptions = {
        columns: [
            {
                field: "spottingDate",
                header: "Spotting Date",
                fieldType: "date",
                order: 1,
            },
            {
                field: "status",
                header: "Status",
                fieldType: "status",
                order: 2,
            },
            {
                field: "type",
                header: "Type",
                fieldType: "type",
                order: 3,
            }, 
            {
                field: "notes",
                header: "Notes",
                fieldType: "text",
                order: 4,
            },
        ],
    };

    tableWidthConfig: TableWidthConfig[] = [
        { field: "spottingDate", width: "100px" },
        { field: "status", width: "150px" },
        { field: "type", width: "150px" },
        { field: "notes", width: "500px" },
    ];

    constructor() {
        return;
    }

    ngOnInit(): void {
        return;
    }
}
