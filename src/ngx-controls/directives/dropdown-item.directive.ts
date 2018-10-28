import {Directive, ElementRef, HostListener, Input, OnDestroy, OnInit} from "@angular/core";
import {IDropdownComponent, ISelectComponentOption} from "../common-types";
import {Subscription} from "rxjs";

@Directive({
    selector: "[dropdownItem]"
})
export class DropdownItemDirective implements OnInit, OnDestroy {

    @Input("dropdownItem") option: ISelectComponentOption;
    @Input() index: number;
    @Input() component: IDropdownComponent;

    get elem(): HTMLElement {
        return this.element.nativeElement;
    }

    private onAutoScroll: Subscription;

    constructor(private element: ElementRef) {

    }

    ngOnInit(): void {
        this.onAutoScroll = this.component.onAutoScroll.subscribe(scrollTo => {
            if (scrollTo !== this.option) return;
            const container = this.elem.parentElement;
            container.scrollTop = this.elem.offsetTop - container.offsetHeight / 2 + this.elem.offsetHeight / 2;
        });
    }

    ngOnDestroy(): void {
        this.onAutoScroll.unsubscribe();
    }

    @HostListener("click")
    click(): void {
        this.component.selectOption(this.option);
    }

    @HostListener("mousemove")
    highlight(): void {
        this.component.highlightedOption = this.option;
        this.component.highlightedIndex = this.index;
    }
}
