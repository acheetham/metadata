/*

Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var gpii = gpii || {};

(function ($, fluid) {

    /**
     * "gpii.metadata.feedback.bindDialog" is a view component that accepts a "button" container. The click on the container triggers following steps:
     *
     * 1. Close the dialog if the dialog exists and opens. Or, create a container for the dialog and fire onRenderDialogContent when the container is ready;
     * 2. Instantiate the subcomponent "renderDialogContent" to render the dialog content into the container created in step 1;
     *    Note: The actual component for "renderDialogContent" MUST be provided by integrators via "panelType" and "renderDialogContent" options
     *    at the top level of {bindDialog}. Also fire {bindDialog}.events.onDialogContentReady event when the content is rendered.
     * 3. Once the content is ready, the container is instantiated into a jQuery dialog;
     * 4. When the dialog is ready, i) open it; ii) hook up event handlers that would close the dialog when clicking anywhere outside of the dialog.
     *
     * Note: every click on the container triggers re-rendering of the dialog content using onRenderDialogContent event.
     **/

    "use strict";

    fluid.registerNamespace("gpii.metadata.feedback");

    fluid.defaults("gpii.metadata.feedback.modelToClass", {
        gradeNames: ["fluid.viewComponent", "autoInit"],
        modelToClass: {},
        listeners: {
            "onCreate.setModelListeners": {
                listener: "gpii.metadata.feedback.modelToClass.bind",
                args: ["{that}"]
            }
        }
    });

    gpii.metadata.feedback.modelToClass.bind = function (that) {
        fluid.each(that.options.modelToClass, function (style, modelPath) {
            that.applier.modelChanged.addListener(modelPath, function (value) {
                that.container.toggleClass(fluid.get(that.options.styles, style), value);
            });
        });
    };

    fluid.defaults("gpii.metadata.feedback.trackFocus", {
        gradeNames: ["gpii.metadata.feedback.modelToClass", "autoInit"],
        model: {
            isFocused: {}
        },
        listeners: {
            "onCreate.trackFocus": {
                listener: "gpii.metadata.feedback.bindUIState",
                args: ["{that}", "isFocused", "focus", "blur"]
            }
        }
    });

    fluid.defaults("gpii.metadata.feedback.trackBlur", {
        gradeNames: ["gpii.metadata.feedback.modelToClass", "autoInit"],
        model: {
            isHovered: {}
        },
        listeners: {
            "onCreate.trackBlur": {
                listener: "gpii.metadata.feedback.bindUIState",
                args: ["{that}", "isHovered", "mouseover", "mouseleave"]
            }
        }
    });

    gpii.metadata.feedback.bindUIState = function (that, modelPath, onEvent, offEvent) {
        fluid.each(fluid.get(that.model, modelPath), function (state, selector) {
            var elm = selector === "container" ? that.container : that.locate(selector);
            elm.on(onEvent, function () {
                that.applier.change([modelPath, selector], true);
            });
            elm.on(offEvent, function () {
                that.applier.change([modelPath, selector], false);
            });
        });
    };

    fluid.defaults("gpii.metadata.feedback.bindDialog", {
        gradeNames: ["fluid.viewRelayComponent", "gpii.metadata.feedback.trackFocus", "gpii.metadata.feedback.trackBlur", "autoInit"],
        components: {
            renderDialogContent: {
                type: "fluid.rendererRelayComponent",
                createOnEvent: "onRenderDialogContent",
                container: "{bindDialog}.dialogContainer",
                options: {
                    gradeNames: ["{that}.options.panelType"]
                }
            },
            tooltip: {
                type: "fluid.tooltip",
                container: "{bindDialog}.dom.icon",
                options: {
                    content: "{bindDialog}.options.strings.buttonLabel",
                    styles: {
                        tooltip: "gpii-feedback-tooltip"
                    },
                    position: {
                        my: "center top",
                        at: "center-10% bottom+42%",
                        of: "{bindDialog}.container"
                    },
                    delay: 0,
                    duration: 0,
                    modelListeners: {
                        "{bindDialog}.model.isDialogOpen": [{
                            "this": "{that}.container",
                            method: "tooltip",
                            args: ["option", "disabled", "{change}.value"]
                        }, {
                            "funcName": "gpii.metadata.feedback.reopenTooltip",
                            args: ["{that}", "{change}.value"]
                        }]
                    },
                    listeners: {
                        "onCreate.unbindESC": {
                            listener: "gpii.metadata.feedback.unbindESC",
                            args: ["{that}.container"]
                        },
                        "afterOpen.updateModel": {
                            func: "{bindDialog}.applier.change",
                            args: ["isTooltipOpen", true]
                        },
                        "afterClose.updateModel": {
                            func: "{bindDialog}.applier.change",
                            args: ["isTooltipOpen", false]
                        }
                    }
                }
            }
        },
        members: {
            dialog: null,
            dialogContainer: null
        },
        selectors: {
            icon: ".gpiic-icon"
        },
        strings: {
            buttonLabel: null
        },
        styles: {
            active: "gpii-icon-active",
            openIndicator: "gpii-icon-arrow",
            focus: "gpii-feedback-buttonFocus",
            hover: "gpii-feedback-buttonHover"
        },
        markup: {
            dialog: "<section>&nbsp;</section>"
        },
        commonDialogOptions: {
            closeOnEscape: true,
            autoOpen: false,
            minHeight: 0,
            resizable: false,
            width: 450,
            position: {
                my: "center top",
                at: "center-10% bottom+42%",
                of: "{that}.container"
            },
            dialogClass: "gpii-feedback-noClose gpii-feedback-dialog"
        },
        events: {
            onRenderDialogContent: null,
            onDialogContentReady: null,
            onBindDialogHandlers: null,
            onDialogReady: null,
            onFocusIcon: null,
            onBlurIcon: null,
            onHoverIcon: null,
            onHoverOffIcon: null
        },
        listeners: {
            "onCreate.addAriaRole": {
                "this": "{that}.container",
                method: "attr",
                args: ["role", "button"]
            },
            "onCreate.addAriaLabel": {
                "this": "{that}.container",
                method: "attr",
                args: ["aria-label", "{that}.options.strings.buttonLabel"]
            },
            "onCreate.bindButtonClick": {
                "this": "{that}.container",
                method: "click",
                args: "{that}.bindButton"
            },
            "onCreate.bindKeyboard": {
                listener: "fluid.activatable",
                args: ["{that}.container", "{that}.bindButton"]
            },
            "onDialogContentReady.instantiateDialog": "{that}.instantiateDialog",
            "onDialogReady.openDialog": {
                "this": "{that}.dialog",
                method: "dialog",
                args: "open"
            }
        },
        model: {
            isActive: false,    // Keep track of the active state of the button
            isDialogOpen: false,
            isTooltipOpen: false,
            isFocused: {
                icon: false
            },
            isHovered: {
                icon: false
            }
        },
        /* 
         * Used by the gpii.metadata.feedback.modelToClass to add/remove the
         * style on the rhs based on the value of the model path from the lhs
         */
        modelToClass: {
            "isFocused.icon": "focus",
            "isHovered.icon": "hover"
        },
        modelListeners: {
            "isActive": "gpii.metadata.feedback.handleActiveState({change}.value, {that}.container, {that}.options.styles.active)",
            // passing in invokers directly to ensure they are resolved at the correct time.
            "isDialogOpen": [
                "gpii.metadata.feedback.handleDialogState({that}, {change}.value, {that}.closeDialog, {that}.bindIframeClick, {that}.unbindIframeClick)",
                "gpii.metadata.feedback.handleIndicatorState({that}.container, {that}.model, {that}.options.styles.openIndicator)"
            ],
            "isTooltipOpen": "gpii.metadata.feedback.handleIndicatorState({that}.container, {that}.model, {that}.options.styles.openIndicator)"
        },
        invokers: {
            bindButton: {
                funcName: "gpii.metadata.feedback.bindButton",
                args: ["{that}", "{arguments}.0"]
            },
            instantiateDialog: {
                funcName: "gpii.metadata.feedback.instantiateDialog",
                args: ["{that}"]
            },
            closeDialog: {
                "this": "{that}.dialog",
                method: "dialog",
                args: "close"
            },
            bindIframeClick: {
                funcName: "gpii.metadata.feedback.bindIframeClick",
                args: ["{that}.closeDialog"]
            },
            unbindIframeClick: "gpii.metadata.feedback.unbindIframeClick"
        },
        distributeOptions: [{
            source: "{that}.options.panelType",
            removeSource: true,
            target: "{that > renderDialogContent}.options.panelType"
        }, {
            source: "{that}.options.renderDialogContentOptions",
            removeSource: true,
            target: "{that > renderDialogContent}.options"
        }]
    });

    gpii.metadata.feedback.bindButton = function (that, event) {
        event.preventDefault();

        if (that.dialog && that.model.isDialogOpen && that.model.isActive) {
            that.closeDialog();
        } else if (!that.model.isActive) {
            if (!that.dialogContainer) {
                that.dialogContainer = $(that.options.markup.dialog);
            }
            that.events.onRenderDialogContent.fire();
        }

        that.applier.change("isActive", !that.model.isActive);
    };

    gpii.metadata.feedback.instantiateDialog = function (that) {
        if (!that.dialog) {
            var moreOptions = {
                open: function () {
                    that.applier.change("isDialogOpen", true);
                },
                close: function () {
                    that.applier.change("isDialogOpen", false);
                }
            };

            var fullOptions = $.extend(true, moreOptions, that.options.commonDialogOptions);

            that.dialog = that.dialogContainer.dialog(fullOptions);
            var dialogId = fluid.allocateSimpleId(that.dialog);
            that.container.attr("aria-controls", dialogId);

            that.events.onBindDialogHandlers.fire();
        }

        that.events.onDialogReady.fire(that.dialog);
    };

    gpii.metadata.feedback.handleActiveState = function (isActive, buttonDom, activeCss) {
        buttonDom.toggleClass(activeCss, isActive);
        buttonDom.attr("aria-pressed", isActive);
    };

    gpii.metadata.feedback.handleDialogState = function (that, isDialogOpen, closeDialogFn, bindIframeClickFn, unbindIframeClickFn) {
        var button = that.container;
        var dialog = that.dialog;

        if (isDialogOpen) {
            bindIframeClickFn();
            fluid.globalDismissal({
                button: button,
                dialog: dialog
            }, closeDialogFn);
        } else {
            // manually unbind fluid.globalDismissal; particularly for cases where the dialog is closed without a click outside the component.
            if (dialog) {
                fluid.globalDismissal({
                    button: button,
                    dialog: dialog
                }, null);
            }
            unbindIframeClickFn();
        }
    };

    gpii.metadata.feedback.handleIndicatorState= function (elm, model, style) {
        elm.toggleClass(style, model.isDialogOpen || model.isTooltipOpen);
    };

    gpii.metadata.feedback.getIframes = function () {
        return $("body").find("iframe").contents().find("body");
    };

    gpii.metadata.feedback.bindIframeClick = function (closeDialogFunc) {
        var iframes = gpii.metadata.feedback.getIframes();
        iframes.on("click.closeDialog", function () {
            closeDialogFunc();
        });
    };

    gpii.metadata.feedback.unbindIframeClick = function () {
        var iframes = gpii.metadata.feedback.getIframes();
        iframes.off("click.closeDialog");
    };

    // This is meant to be used as a model listener for isDialogOpen
    // If the dialog is closed, focus is pushed back onto the button,
    // which should trigger the tooltip to reappear.
    gpii.metadata.feedback.reopenTooltip = function (tooltip, isDialogOpen) {
        if (!isDialogOpen) {
            tooltip.container.tooltip("open");
        }
    };

    gpii.metadata.feedback.unbindESC = function (elm) {
        var elms = elm.contents().addBack(); // self plus decendants
        elms.keyup(function (e) {
            if (e.keyCode === $.ui.keyCode.ESCAPE) {
                e.stopImmediatePropagation();
            }
        });
    };

})(jQuery, fluid);
