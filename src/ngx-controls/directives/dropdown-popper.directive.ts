import {ChangeDetectorRef, Directive, Input, OnDestroy, OnInit} from "@angular/core";
import {Subscription} from "rxjs";
import {Placement, PopperContent} from "ngx-popper";
import {DropdownDirective} from "./dropdown.directive";

@Directive({
    selector: "[dropdownPopper]",
    exportAs: "dropdown-popper",
})
export class DropdownPopperDirective implements OnInit, OnDestroy {

    @Input() placement: Placement;
    @Input() flip: string[];

    private onShown: Subscription;
    private onHidden: Subscription;

    constructor(public cdr: ChangeDetectorRef, public popper: PopperContent, public dropdown: DropdownDirective) {
        this.placement = "bottom-end";
        this.flip = ["bottom", "top"];
    }

    ngOnInit(): void {
        this.onShown = this.dropdown.onShown.subscribe(() => {
            this.popper.popperOptions = {
                placement: this.placement,
                trigger: "click",
                disableAnimation: true,
                disableDefaultStyling: true,
                boundariesElement: "",
                positionFixed: false,
                popperModifiers: {
                    flip: {
                        behavior: this.flip
                    },
                    computeStyle: {
                        gpuAcceleration: false
                    }
                }
            };
            this.popper.referenceObject = this.dropdown.nativeElement;
            this.popper.show();
            this.cdr.detectChanges();
        });
        this.onHidden = this.dropdown.onHidden.subscribe(() => this.popper.hide());
    }

    ngOnDestroy(): void {
        this.onShown.unsubscribe();
    }
}
