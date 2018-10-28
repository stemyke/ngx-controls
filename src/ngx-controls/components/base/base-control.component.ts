import {
    ChangeDetectorRef, ContentChild, ElementRef, EventEmitter, HostBinding, Inject, Input, OnChanges, OnDestroy,
    OnInit, Renderer2, SimpleChange, SimpleChanges, TemplateRef
} from "@angular/core";
import {ObjectUtils} from "@stemy/ngx-utils";

export abstract class BaseControlComponent implements OnInit, OnDestroy, OnChanges {

    @Input() label: string;
    @Input() hidden: boolean;
    @Input() disabled: boolean;
    @Input() onChange: EventEmitter<any>;

    @ContentChild("replaceTemplate")
    replaceTemplate: TemplateRef<any>;

    get hide(): boolean {
        return this.hidden;
    }

    get show(): boolean {
        return !this.hide;
    }

    @HostBinding("class.hide")
    get cssHide(): boolean {
        return this.hide && !this.replaceTemplate;
    }

    @HostBinding("class.show")
    get cssShow(): boolean {
        return !this.cssHide;
    }

    @HostBinding("class.disabled")
    get isDisabled(): boolean {
        return this.hide || this.disabled;
    }

    protected cachedValues: any;

    constructor(@Inject(ElementRef) public element: ElementRef,
                @Inject(Renderer2) public renderer: Renderer2,
                @Inject(ChangeDetectorRef) public cdr: ChangeDetectorRef) {
        this.cachedValues = {};
        this.ctrInit();
    }

    ctrInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        ObjectUtils.iterate(changes, (change: SimpleChange, key) => {
            this.cachedValues[key] = change.currentValue;
        });
        this.buildData(changes);
        this.cdr.detectChanges();
    }

    protected buildData(changes: any): void {

    }
}
