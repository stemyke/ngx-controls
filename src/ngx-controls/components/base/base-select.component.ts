import {
    AfterContentInit,
    ContentChild,
    ContentChildren,
    EventEmitter,
    HostBinding,
    Input,
    Output,
    QueryList,
    SimpleChanges,
    TemplateRef, ViewChild
} from "@angular/core";
import {IGroupMap, ObjectUtils} from "@stemy/ngx-utils";
import {
    IParameterBag,
    ISelectComponentGroup,
    ISelectComponentOption,
    OptionLabelFormatter
} from "../../common-types";
import {BaseImageControlComponent} from "./base-image-control.component";
import {TabTemplateDirective} from "../../directives/tab-template.directive";

export abstract class BaseSelectComponent extends BaseImageControlComponent implements AfterContentInit {

    @Input() disableSingleOption: boolean;
    @Input() labelSeparator: string;
    @Input() labelFormat: string;
    @Input() labelFormatter: OptionLabelFormatter;
    @Input() unique: boolean;
    @Input() strict: boolean;
    @Input() group: string;
    @Input() groupMap: IGroupMap;
    @Input() options: any[];
    @Input() selected: any;
    @Input() title: string;
    @Output() selectedChange: EventEmitter<any>;
    @Output() optionSelected: EventEmitter<ISelectComponentOption>;

    optionFilter: (option: ISelectComponentOption) => boolean;
    classRegex: RegExp;
    imageClass: string;
    emptyOption: ISelectComponentOption;
    labelByIndex: (index: number) => Promise<string>;
    selectByIndex: (index: number) => void;
    selectedIndex: number;
    selectOptions: ISelectComponentOption[];
    selectGroups: ISelectComponentGroup[];

    get selectedOption(): ISelectComponentOption {
        return this.selectOptions[this.selectedIndex] || this.emptyOption;
    }

    set selectedOption(option: ISelectComponentOption) {
        this.selectedIndex = this.selectOptions.indexOf(option);
    }

    templates: {
        [tab: string]: TemplateRef<any>;
    };

    @ContentChildren(TabTemplateDirective)
    templateDirectives: QueryList<TabTemplateDirective>;

    @ContentChild("wrapperTemplate")
    wrapperTemplate: TemplateRef<any>;

    @ContentChild("itemTemplate")
    itemTemplate: TemplateRef<any>;

    @ViewChild("listTemplate")
    listTemplate: TemplateRef<any>;

    @HostBinding("class.has-image")
    hasImage: boolean;

    @HostBinding("class.hide")
    get hide(): boolean {
        return this.hidden || this.selectOptions.length == 0;
    }

    get isDisabled(): boolean {
        return this.disabled || this.hide || this.isSingleOption;
    }

    @HostBinding("class.disabled")
    get cssDisabled(): boolean {
        return this.disabled || this.hide || (this.disableSingleOption && this.isSingleOption);
    }

    get isSingleOption(): boolean {
        return this.selectOptions.length == 1 && this.selectOptions[0] == this.selectedOption;
    }

    ngAfterContentInit(): void {
        this.templates = this.templateDirectives.reduce((result, directive) => {
            result[directive.tab] = directive.templateRef;
            return result;
        }, {});
    }

    ctrInit(): void {
        // Default image options
        super.ctrInit();
        // Default options
        this.group = "";
        // Default label formatter
        this.labelSeparator = " / ";
        this.labelFormat = "'' + option";
        this.labelFormatter = (option: ISelectComponentOption, params: IFormatterParameters) => {
            return new Promise<string>(resolve => {
                // If option if not defined
                if (ObjectUtils.isNullOrUndefined(option)) {
                    resolve("");
                    return;
                }
                // If format is specified or option type is ok
                const typeFormats = {
                    mm: this.formatter.defaultNumberFormat,
                    size: this.formatter.ringSizeFormat,
                    carat: this.formatter.caratFormat
                };
                const typePrecisions = {
                    mm: 2,
                    size: 2,
                    carat: 3
                };
                const hasType = ObjectUtils.isString(typeFormats[option.type]);
                const hasFormat = ObjectUtils.isString(params.format) && params.format.length > 0;
                if (hasType || hasFormat) {
                    const format = hasFormat ? params.format : typeFormats[option.type];
                    const precision = isNaN(params.precision) ? typePrecisions[option.type] : params.precision;
                    resolve(this.formatter.formatNumberOption(option, format, precision, params.divider, params.prop));
                    return;
                }
                // Translate labels otherwise
                const labels = [];
                if (ObjectUtils.isArray(option.definitions)) {
                    // Unique definitions
                    const definitions: ISelectComponentOption[] = [];
                    option.definitions.forEach(def => {
                        if (this.unique && definitions.findIndex(t => t.id == def.id) >= 0) return;
                        definitions.push(def);
                        const label = ObjectUtils.isDefined(def.label) ? def.label.toString() : "";
                        if (label.length > 0) labels.push(label);
                    });
                    option.definitions = definitions;
                } else {
                    const label = ObjectUtils.isDefined(option.label) ? option.label.toString() : "";
                    if (label.length > 0) labels.push(label);
                }
                if (labels.length == 0) {
                    resolve(ObjectUtils.isDefined(option.count) ? option.count.toString() : "");
                    return;
                }
                const promises = labels.map(l => this.language.getTranslation(l, option.params));
                Promise.all(promises).then(translations => {
                    const label = translations.join(this.labelSeparator);
                    resolve(ObjectUtils.isDefined(option.count) ? `${label} (${option.count})` : label);
                });
            });
        };
        this.formatterParams = {};
        this.selected = null;
        this.selectedChange = new EventEmitter<any>();
        this.optionSelected = new EventEmitter<ISelectComponentOption>();
        this.optionFilter = (option: ISelectComponentOption) => {
            return typeof this.selected !== "undefined" && (option.value === this.selected || option.id === this.selected);
        };
        this.classRegex = /\//g;
        this.imageClass = "";
        this.emptyOption = {
            id: "empty",
            label: "",
            selectable: true,
            searchLabel: ""
        };
        this.labelByIndex = (index: number) => {
            const option = this.selectOptions[index];
            if (!option) return Promise.resolve("");
            return this.labelFormatter(option, this.formatterParams);
        };
        this.selectByIndex = (index: number) => {
            this.selectOption(this.selectOptions[index]);
        };
        this.selectOptions = [];
        this.selectGroups = [];
        this.selectedOption = this.emptyOption;
        this.templates = {};
    }

    buildData(changes: SimpleChanges): void {
        this.hasImage = false;
        this.imageClass = !this.image ? "" : `${this.image}-image`;
        this.selectOptions = this.fixOptions(this.options);
        this.selectGroups = this.generateGroups();
        this.selectedOption = this.selectOptions.find(this.optionFilter);
        if (!this.strict || this.selectOptions.indexOf(this.selectedOption) >= 0) return;
        this.selectedOption = this.selectOptions[0];
        this.selected = this.selectedOption.id;
    }

    selectOption(option: ISelectComponentOption): void {
        if (this.ignoreEmit || (!this.debug.clickableDisabledOptions && !option.selectable)) return;
        this.selected = option.id;
        this.selectedOption = option;
        this.selectedChange.emit(option.id);
        this.optionSelected.emit(option);
        this.onChange.emit(option.id);
    }

    toggleSpecial(option: ISelectComponentOption, ev: Event): void {
        ev.stopPropagation();
        const params = this.params ? {...this.params} : {};
        params.name = this.command;
        params.id = option.id;
        this.container.apply("context.toggleSpecialDefinition", params);
    }

    fixOptions(options: any[]): ISelectComponentOption[] {
        if (!options) return [];
        if (!ObjectUtils.isArray(options)) {
            console.log(`${this.command} options is not an array: `, options);
            return [];
        }
        return options.map(o => {
            const option: ISelectComponentOption = ObjectUtils.isPrimitive(o)
                ? {
                    id: o,
                    label: ObjectUtils.evaluate(this.labelFormat, {option: o}) || `${o}`,
                    selectable: true
                } : Object.assign({}, o);
            let imagePromise = Promise.resolve(null);
            if (option.definitions) {
                option.definitions = this.fixOptions(option.definitions);
            } else if (this.image) {
                imagePromise = this.getImage(option);
                imagePromise.then(image => {
                    const target = this.imageType == "content" || this.imageType == "icon" ? "image" : "background";
                    option[target] = image;
                });
            }
            imagePromise.then(() => {
                // If option has a background then set it in imageStyle
                if (option.background) {
                    option.imageStyle = Object.assign({
                        backgroundImage: option.background
                    }, option.imageStyle);
                }
                // If option has an imageStyle, then set hasImage
                this.hasImage = this.hasImage || ObjectUtils.isString(option.image) || ObjectUtils.isObject(option.imageStyle);
            });
            // Return option
            return option;
        });
    }

    protected generateGroups(): ISelectComponentGroup[] {
        if (!this.group) return [{id: null, label: this.label, selectable: true, title: this.title, items: this.selectOptions}];
        const groups = (this.selectOptions || []).reduce((result: any, item: any) => {
            const key = ObjectUtils.getValue(item, this.group) || "";
            const col = this.groupMap ? (this.groupMap[key] || "") : key;
            const group: any[] = result[col] || [];
            group.push(item);
            result[col] = group;
            return result;
        }, {});
        return Object.keys(groups).map(key => {
            return {id: key, label: !this.label ? null : `${this.label}.${key}`, selectable: true, title: !this.title ? null : `${this.title}.${key}`, items: groups[key]};
        });
    }
}
