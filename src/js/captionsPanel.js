/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    fluid.registerNamespace("fluid.metadata");

    /*******************************************************************************
     * The panel to define captions related metadata
     *******************************************************************************/

    fluid.defaults("fluid.metadata.captionsPanel", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        model: {
            captions: [{
                src: "",
                language: "en"
            }, {
                src: "",
                language: "en"
            }]
        },
        components: {
            input1: {
                type: "fluid.metadata.captionsPanel.captionInput",
                container: "{captionsPanel}.dom.input1",
                createOnEvent: "afterRender",
                options: {
                    model: "{captionsPanel}.model.captions.0",
                    events: {
                        afterRender: "{captionsPanel}.events.afterRenderInput1"
                    },
                    modelListeners: {
                        "*": {
                            func: "{captionsPanel}.events.inputModelChanged.fire",
                            args: ["{change}.path", "{change}.value", 0]
                        }
                    }
                }
            },
            input2: {
                type: "fluid.metadata.captionsPanel.captionInput",
                container: "{captionsPanel}.dom.input2",
                createOnEvent: "afterRender",
                options: {
                    model: "{captionsPanel}.model.captions.1",
                    events: {
                        afterRender: "{captionsPanel}.events.afterRenderInput2"
                    },
                    modelListeners: {
                        "*": {
                            func: "{captionsPanel}.events.inputModelChanged.fire",
                            args: ["{change}.path", "{change}.value", 1]
                        }
                    }
                }
            },
            icon: {
                type: "fluid.metadata.indicator",
                container: "{captionsPanel}.dom.icon",
                createOnEvent: "afterRender",
                options: {
                    model: {
                        value: {
                            expander: {
                                funcName: "{captionsPanel}.getIconModelValue"
                            }
                        }
                    },
                    tooltipContent: {
                        "available": "${captionsPanel}.options.strings.captionsAvailable",
                        "unavailable": "${captionsPanel}.options.strings.captionsUnavailable",
                        "unknown": "${captionsPanel}.options.strings.captionsUnavailable"
                    },
                    events: {
                        onCreate: {
                            events: "{captionsPanel}.events.afterRenderIcon",
                            priority: "last"
                        }
                    }
                }
            }
        },
        strings: {
            title: "Captions",
            instruction: "Captions provide a synchronized, equivalent text version of spoken word in a video.",
            captionsAvailable: "Captions are available in this video.",
            captionsUnavailable: "Captions are not available in this video."
        },
        selectors: {
            title: ".flc-captions-title",
            icon: ".flc-captions-icon",
            instruction: ".flc-caption-instruction",
            input1: ".flc-captions-input-1",
            input2: ".flc-captions-input-2"
        },
        selectorsToIgnore: ["icon", "input1", "input2"],
        protoTree: {
            title: {messagekey: "title"},
            instruction: {messagekey: "instruction"}
        },
        resources: {
            template: {
                src: "../html/captions-template.html"
            }
        },
        invokers: {
            getIconModelValue: {
                funcName: "fluid.metadata.captionsPanel.getIconModelValue",
                args: "{that}.model"
            }
        },
        events: {
            inputModelChanged: null,
            afterRenderInput1: null,
            afterRenderInput2: null,
            afterRenderIcon: null,
            onReady: {
                events: {
                    onCreate: "onCreate",
                    afterRenderInput1: "afterRenderInput1",
                    afterRenderInput2: "afterRenderInput2",
                    afterRenderIcon: "afterRenderIcon"
                },
                args: "{that}"
            }
        },
        listeners: {
            "onCreate.init": "fluid.metadata.captionsPanel.init",
            "inputModelChanged.updateModel": {
                listener: "fluid.metadata.captionsPanel.updateModel",
                args: ["{that}", "{arguments}.0", "{arguments}.1", "{arguments}.2"]
            }
        },
        modelListeners: {
            "*": {
                func: "fluid.metadata.captionsPanel.refreshIcon",
                args: "{that}"
            }
        },
        distributeOptions: [{
            source: "{that}.options.captionsInputTemplate",
            target: "{that > input1}.options.resources.template.url"
        }, {
            source: "{that}.options.captionsInputTemplate",
            target: "{that > input2}.options.resources.template.url"
        }]
    });

    fluid.metadata.captionsPanel.init = function (that) {
        fluid.fetchResources(that.options.resources, function (resourceSpec) {
            that.refreshView();
        });
    };

    fluid.metadata.captionsPanel.updateModel = function (captionsPanel, path, value, index) {
        var captionsModel = fluid.get(captionsPanel.model, "captions");
        fluid.set(captionsModel, [index, path[0]], value);
        captionsPanel.applier.requestChange("captions", captionsModel);
    };

    fluid.metadata.captionsPanel.getIconModelValue = function (captionsModel) {
        return fluid.find(captionsModel.captions, function (caption) {
            if (caption.src && caption.src !== "") {
                return "available";
            }
        }, "unavailable");
    };

    fluid.metadata.captionsPanel.refreshIcon = function (that) {
        that.icon.applier.requestChange("value", that.getIconModelValue());
    };

    /*******************************************************************************
     * The panel to render caption input fields: src and language
     *******************************************************************************/

    fluid.defaults("fluid.metadata.captionsPanel.captionInput", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            srcLabel: ".flc-captions-srcLabel",
            src: ".flc-captions-src",
            languagesLabel: ".flc-captions-languagesLabel",
            languages: ".flc-captions-languages"
        },
        strings: {
            srcLabel: "Enter web link to caption:",
            languagesLabel: "Select language:",
            srcPlaceholder: "www.example.com/movie.srt",
            languages: ["Arabic", "Chinese", "English", "French", "Hindi", "Spanish"]
        },
        model: {
            src: "",
            language: "en"
        },
        controlValues: ["ar", "zh", "en", "fr", "hi", "es"],
        protoTree: {
            srcLabel: {messagekey: "srcLabel"},
            src: {
                value: "${src}",
                decorators: {
                    type: "attrs",
                    attributes: {placeholder: "${{that}.options.strings.srcPlaceholder}"}
                }
            },
            languagesLabel: {messagekey: "languagesLabel"},
            languages: {
                "selection": "${language}",
                "optionlist": "${{that}.options.controlValues}",
                "optionnames": "${{that}.options.strings.languages}"
            }
        },
        listeners: {
            "onCreate.init": "fluid.metadata.captionsPanel.captionInput.init"
        },
        resources: {
            template: {
                url: "../html/captions-input-template.html",
                forceCache: true
            }
        }
    });

    fluid.metadata.captionsPanel.captionInput.init = function (that) {
        fluid.fetchResources(that.options.resources, function (resourceSpec) {
            that.refreshView();
        });
    };

})(jQuery, fluid_1_5);
