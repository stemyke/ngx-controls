import {ModuleWithProviders, NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {NgxUtilsModule} from "@stemy/ngx-utils";
import {NgxPopperModule} from "ngx-popper";

import {DropdownItemDirective} from "./directives/dropdown-item.directive";
import {DropdownPopperDirective} from "./directives/dropdown-popper.directive";
import {TabTemplateDirective} from "./directives/tab-template.directive";

import {ButtonGroupComponent} from "./components/button-group/button-group.component";

// --- Components ---
export const components = [
    ButtonGroupComponent
];

// --- Directives ---
export const directives = [
    DropdownItemDirective,
    DropdownPopperDirective
];

// --- Pipes ---
export const pipes = [];

@NgModule({
    declarations: [
        ...components,
        ...directives,
        ...pipes
    ],
    imports: [
        CommonModule,
        NgxUtilsModule.forRoot(),
        NgxPopperModule.forRoot({disableDefaultStyling: true, disableAnimation: true})
    ],
    exports: [
        ...components,
        ...directives,
        ...pipes,
        NgxUtilsModule,
        NgxPopperModule
    ],
    entryComponents: components,
    providers: pipes
})
export class NgxControlsModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: NgxControlsModule,
            providers: [

            ]
        }
    }
}
