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
            highContrast: false,
            signLanguage: false,
            flashing: "unknown", // flashing, noFlashing are alternatives
        },
        strings: {
            title: "Captions",
            instruction: "Captions provide a real-time, equivalent text version of the spoken word in a video."
        },
        selectors: {
            title: ".flc-captions-title",
            icon: ".flc-captions-icon",
            instruction: ".flc-caption-instruction"
        },
        protoTree: {
            title: {messagekey: "title"},
            instruction: {messagekey: "instruction"}
        },
        resources: {
            template: {
                url: "../html/captions-template.html"
            }
        },
        events: {
            onReady: {
                events: {
                    onCreate: "onCreate",
                    afterRender: "afterRender"
                },
                args: "{that}"
            }
        },
        listeners: {
            "onCreate.init": "fluid.metadata.captionsPanel.init"
        },
        modelListeners: {
            "*": {
                func: "{that}.refreshView"
            }
        }
    });

    fluid.metadata.captionsPanel.init = function (that) {
        fluid.fetchResources(that.options.resources, function (resourceSpec) {
            that.refreshView();
        });
    };

    fluid.defaults("fluid.metadata.captionsPanel.captionInput", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        selectors: {
            urlLabel: "flc-captions-urlLabel",
            url: "flc-captions-url",
            languagesLabel: "flc-captions-languagesLabel",
            languages: "flc-captions-languages",
        },
        repeatingSelectors: ["languages"],
        strings: {
            urlLabel: "Enter web link to caption:",
            languagesLabel: "Enter language:",
            urlPlaceholder: "www.example.com/movie.srt",
            languages: ["Arabic", "Chinese", "English", "French", "Hindi", "Spanish"]
        },
        model: {
            url: "",
            language: "en"
        },
        renderOnInit: true,
        controlValues: ["ar", "zh", "en", "fr", "hi", "es"],
        protoTree: {
            urlLabel: {messagekey: "urlLabel"},
            url: {
                value: "${url}",
                decorators: {
                    type: "attrs",
                    attributes: {placeholder: "${{that}.options.strings.urlPlaceholder}"}
                }
            },
            languagesLabel: {messagekey: "languagesLabel"},
            languages: {
                "selection": "${language}",
                "optionlist": "${{that}.options.controlValues}",
                "optionnames": "${{that}.options.strings.languages}"
            }
        }
    });

})(jQuery, fluid_1_5);
