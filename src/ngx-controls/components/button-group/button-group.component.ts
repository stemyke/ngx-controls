import {Component, ViewEncapsulation} from "@angular/core";
import {BaseControlComponent} from "../base/base-control.component";
import {BaseSelectComponent} from "../base/base-select.component";

@Component({
    moduleId: module.id,
    selector: "button-group",
    templateUrl: "./button-group.component.html",
    encapsulation: ViewEncapsulation.None,
    providers: [{provide: BaseControlComponent, useExisting: ButtonGroupComponent }]
})
export class ButtonGroupComponent extends BaseSelectComponent {

    ctrInit(): void {
        super.ctrInit();
        this.disableSingleOption = false;
        this.componentClass = "button-group";
    }
}
