/*!
 * Copyright (c) Microsoft Corporation.
 * All rights reserved. See LICENSE in the project root for license information.
 */

import {
    getPayloadObject,
    getTelemetryAttributes,
    getTelemetryObject,
    IModuleProps,
    INodeProps,
    IPayLoad,
    ITelemetryContent,
    NodeTag,
    TelemetryConstant
} from '@msdyn365-commerce-modules/utilities';
import classnames from 'classnames';
import { observer } from 'mobx-react';
import * as React from 'react';

import { createAccordionStateInput } from '../../actions/accordion-state/accordion-state';
import { IAccordionData } from './accordion.data';
import { IAccordionProps } from './accordion.props.autogenerated';

/**
 *
 * Accordion component.
 * @extends {React.PureComponent<IAccordionProps<IAccordionData>>}
 */

export interface ICallToActionProps {
    link: INodeProps[];
}

/**
 * Added interface for state management.
 */
export interface IAccordianState {
    isDisabled: boolean;
}

export interface IAccordionViewProps extends IAccordionProps<{}> {
    AccordionContainer: IModuleProps;
    HeaderSection: INodeProps;
    accordianButtonsContainer: INodeProps;
    accordionButtons: React.ReactNode;
    accordionItemContainer: INodeProps;
    accordionItems: React.ReactNode;
}

/**
 *
 * Accordion component.
 * @extends {React.Component<IAccordionProps<IAccordionData>>}
 */
@observer
class Accordion extends React.PureComponent<IAccordionProps<IAccordionData>, IAccordianState> {
    private readonly telemetryContent?: ITelemetryContent;

    private readonly payLoad: IPayLoad;

    private readonly expandAllButtonRef: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();

    private readonly collapseAllButtonRef: React.RefObject<HTMLButtonElement> = React.createRef<HTMLButtonElement>();

    constructor(props: IAccordionProps<IAccordionData>) {
        super(props);
        this._onExpandAll = this._onExpandAll.bind(this);
        this._onCollapseAll = this._onCollapseAll.bind(this);
        this.telemetryContent = getTelemetryObject(
            this.props.context.request.telemetryPageName!,
            this.props.friendlyName,
            this.props.telemetry
        );
        this.payLoad = getPayloadObject('click', this.telemetryContent, '');
        this.state = { isDisabled: false };
    }

    public render(): JSX.Element {
        const { slots } = this.props;

        const accordionViewProps = {
            ...this.props,
            AccordionContainer: {
                moduleProps: this.props,
                className: classnames('ms-accordion')
            },
            HeaderSection: { className: 'ms-accordion-header-section' },
            accordianButtonsContainer: {
                tag: 'div' as NodeTag,
                className: 'ms-accordion-header-section-toggle-button-container'
            },
            accordionButtons: this._renderAccordionButton(),
            accordionItemContainer: {
                tag: 'div' as NodeTag,
                className: 'ms-accordion-item-section'
            },
            accordionItems:
                slots &&
                slots.accordionItems &&
                slots.accordionItems.length > 0 &&
                slots.accordionItems.map((item: React.ReactNode, index: number) => this._getAccordionItem(item, index))
        };
        return this.props.renderView(accordionViewProps) as React.ReactElement;
    }

    private _renderAccordionButton(): React.ReactNode | null {
        this.payLoad.contentAction.etext = TelemetryConstant.ExpandAll;
        const attributeExpandAll = getTelemetryAttributes(this.telemetryContent!, this.payLoad);
        this.payLoad.contentAction.etext = TelemetryConstant.CollapseAll;
        const attributeCollapseAll = getTelemetryAttributes(this.telemetryContent!, this.payLoad);
        return (
            <>
                <button
                    disabled={this.state.isDisabled}
                    className='ms-accordion_ExpandAll'
                    aria-label='Open all'
                    onClick={this._onExpandAll}
                    ref={this.expandAllButtonRef}
                    {...attributeExpandAll}
                >
                    Open all
                </button>
                &nbsp; | &nbsp;
                <button
                    className='ms-accordion_CollapseAll'
                    aria-label='Close all'
                    onClick={this._onCollapseAll}
                    ref={this.collapseAllButtonRef}
                    {...attributeCollapseAll}
                    disabled={!this.state.isDisabled}
                >
                    Close all
                </button>
            </>
        );
    }

    private _onExpandAll(): void {
        const accordionState = { isAllExpanded: true };
        this.props.context.actionContext.update(createAccordionStateInput(accordionState), accordionState);
        if (accordionState.isAllExpanded) {
            this.setState({
                isDisabled: true
            });
            setTimeout(() => {
                this.collapseAllButtonRef.current?.focus();
            }, 50);
        }
    }

    private _onCollapseAll(): void {
        const accordionState = { isAllExpanded: false };
        this.props.context.actionContext.update(createAccordionStateInput(accordionState), accordionState);
        if (!accordionState.isAllExpanded) {
            this.setState({
                isDisabled: false
            });
            setTimeout(() => {
                this.expandAllButtonRef.current?.focus();
            }, 50);
        }
    }

    private _getAccordionItem(item: React.ReactNode, index: number): React.ReactNode {
        return <React.Fragment key={index}>{React.cloneElement(item as React.ReactElement)}</React.Fragment>;
    }
}

export default Accordion;