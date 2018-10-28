import {EventEmitter} from "@angular/core";

// --- All components ---
export interface IParameterBag {
    [key: string]: any;
}

export type ComponentLabelFormatter = (value: any, params: IParameterBag) => string | Promise<string>;

// --- Select component ---
export interface ISelectComponentOption {
    id: any;
    label: string;
    selectable: boolean;
    value?: any;
    classes?: string;
    meta?: string;
    background?: string;
    image?: string;
    imageStyle?: IParameterBag;
    searchLabel?: string;
    count?: number;
    description?: string;
    definitions?: ISelectComponentOption[];
    type?: string;
    excluded?: boolean;
    visible?: boolean;
    params?: any;
}

export interface ISelectComponentGroup extends ISelectComponentOption {
    title: string;
    items: ISelectComponentOption[];
}

export type OptionLabelFormatter = (option: ISelectComponentOption, params: IParameterBag) => Promise<string>;

export interface IDropdownComponent {
    onAutoScroll: EventEmitter<ISelectComponentOption>;
    highlightedIndex: number;
    highlightedOption: ISelectComponentOption;
    selectOption(option: ISelectComponentOption): void;
}

// --- Slider ---
export interface ISliderValueLimit {
    min: number;
    max: number;
    step: number;
    classes?: string;
    labelBackground?: string;
    dragBackground?: string;
    markerBackground?: string;
    markerWidth?: number;
}

export interface ISliderSegmentMap {
    index: number;
    widthIndex: number;
    height: number;
}

export interface ISliderSegment {
    width: number;
    height: number;
    label?: string;
    color?: string;
    background?: string;
    separation?: boolean;
}
