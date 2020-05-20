   /******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/

 'use strict';

var fs = require("fs");
var path = require("path");
var unitTestcaseHTML = {};
var aChecker = require("../../../../src");
const ace = require("../../../../../accessibility-checker-engine/dist/ace-node");
var testRootDir = path.join(process.cwd(), "..","accessibility-checker-engine","test","v2","checker","accessibility","rules");
var gdirs = fs.readdirSync(testRootDir);
var expect = require("chai").expect;

const mapRuleToG = aChecker.ruleIdToLegacyId;

let mapGToRule = {}
for (const key in mapRuleToG) {
    mapGToRule[mapRuleToG[key]] = key;
}

// Determine which rules are in policy
let validList = {};
let policyMap = {};
const checker = new ace.Checker();
const puppeteer = require('puppeteer');
let browser;
let page;
before(async function () {
    let config = await aChecker.getConfig();
    browser = await puppeteer.launch({ headless: config.headless, ignoreHTTPSErrors: aChecker.Config.ignoreHTTPSErrors || false});
    page = await browser.newPage();
    config.policies.forEach(function (policy) {
        policyMap[policy] = true;
    });

    let rulesets = checker.rulesets;
    rulesets.forEach(function (rs) {
        if (rs.id in policyMap) {
            for (const cp of rs.checkpoints) {
                for (const rule of cp.rules) {
                    validList[rule.id] = true;
                }
            }
        }
    });
})

after(async function () {
    if (browser) {
        await browser.close();
        browser = null;
    }
})

gdirs.forEach(function (gdir) {
    var gdir = path.join(testRootDir, gdir)
    if (fs.lstatSync(gdir).isDirectory()) {
        var files = fs.readdirSync(gdir);
        files.forEach(function (f) {
            var fileExtension = f.substr(f.lastIndexOf('.') + 1);
            if (fileExtension === 'html' || fileExtension === 'htm') {
                var f = path.join(gdir, f);
                unitTestcaseHTML[f] = fs.readFileSync(f, 'utf8');
            };
        });
    }
});

// Skip test cases that don't work in this environment (e.g., can't disable meta refresh in chrome)
var skipList = [

    // Not in Karma Conf Skip list
    // Testcase has a script reference to a file, which traps zombie when loaded as a string
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "Hidden_ruleunit", "unitTestisNodeVisible.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "HAAC_BackgroundImg_HasTextOrTitle_ruleunit", "APassedFileWithNoImg.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Blink_CSSTrigger1_ruleunit", "TextDecoration-Blink.html"),
    // CSS processing errors
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "HAAC_Aria_Native_Host_Sematics_ruleunit", "input_type_test.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "Rpt_Aria_EventHandlerMissingRole_Native_Host_Sematics_ruleunit", "eventHandlerMissingRole2.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "Rpt_Aria_WidgetLabels_Implicit_ruleunit", "menuItemCheckboxNoInnerText.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Style_BeforeAfter_ruleunit", "D100.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Style_ColorSemantics1_ruleunit", "D543.html"),
    // Can't access referenced files
    // no baseline found
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "Rpt_Aria_MultipleBannerLandmarks_Implicit_ruleunit", "validLandMarks-testCaseFromAnn.html"),

    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Img_LinkTextNotRedundant_ruleunit", "Img-redundantLink.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Input_LabelAfter_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Input_LabelBefore_ruleunit", "Input-hasLabelBadPlacement.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Elem_EventMouseAndKey_ruleunit", "Events-invalidNoMouseRequired.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Input_ExplicitLabel_ruleunit", "D766.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_A_HasText_ruleunit", "A-nonTabable.html"),

    //in karma conf file skip list
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_A_HasText_ruleunit", "A-hasTextEmbedded.html"),

    // Meta refresh
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Meta_Refresh_ruleunit", "Meta-invalidRefresh.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Meta_Refresh_ruleunit", "Meta-validRefresh.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "WCAG20_Meta_RedirectZero_ruleunit", "Meta-RefreshZero.html"),

    // Blank titles are removed from the DOM
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Title_Valid_ruleunit","Title-empty.html"),
    path.join(process.cwd(), "..", "accessibility-checker-engine", "test", "v2", "checker", "accessibility", "rules", "RPT_Title_Valid_ruleunit","Title-invalidSpaces.html"),

]

var skipMap = {}
skipList.forEach(function (skip) {
    skipMap[skip] = true;
});

// Describe this Suite of testscases, describe is a test Suite and 'it' is a testcase.
describe("Rule Unit Tests As File URL", function () {
    after(() => {
        aChecker.close();
    });

    // Variable Decleration
    var originalTimeout;

    // Loop over all the unitTestcase html/htm files and perform a scan for them
    for (var unitTestFile in unitTestcaseHTML) {
        if (unitTestFile in skipMap) continue;
        // Get the extension of the file we are about to scan
        var fileExtension = unitTestFile.substr(unitTestFile.lastIndexOf('.') + 1);

        // Make sure the unit testcase we are trying to scan is actually and html/htm files, if it is not
        // just move on to the next one.
        if (fileExtension !== 'html' && fileExtension !== 'htm' && fileExtension !== 'svg') {
            continue;
        }

        // This function is used to execute for each of the unitTestFiles, we have to use this type of function
        // to allow dynamic creation/execution of the Unit Testcases. This is like forcing an syncronous execution
        // for the testcases. Which is needed to make sure that all the tests run in the same order.
        // For now we do not need to consider threaded execution because over all theses testscases will take at
        // most half 1 sec * # of testcses (500ms * 780)
        (function (unitTestFile) {

            // Description of the test case that will be run.
            describe("Load Test: " + unitTestFile, function () {

                // The Individual testcase for each of the unittestcases.
                // Note the done that is passed in, this is used to wait for asyn functions.
                it('a11y scan should match expected value', async function () {
                    this.timeout(0);
                    // Extract the unitTestcase data file from the unitTestcase hash map.
                    // This will contain the full content of the testcase file. Includes the document
                    // object also.
                    var actualMap = {};
                    let report = null;
                    let puppeteer = null;
                    await page.goto("file://"+unitTestFile);

                    // Perform the accessibility scan using the IBMaScan Wrapper
                    return aChecker.getCompliance(page, "Puppeteer_" + unitTestFile)
                        .then((result) => {
                            if (!result || !result.report) {
                                try { expect(false).to.equal(true, "\nWas unable to scan: " + unitTestFile); } catch (e) { return Promise.reject(e); }
                            }
                            report = result.report;
                            puppeteer = result.puppeteer;
                        })
                        .then(async () => {
                            let evalStr = `{
                                "legacyExpectedInfo": typeof(OpenAjax) !== 'undefined' && OpenAjax && OpenAjax.a11y && OpenAjax.a11y.ruleCoverage,
                                "expectedInfo": typeof(UnitTest) !== 'undefined' && UnitTest
                            }`
                            if (puppeteer) {
                                return puppeteer.evaluate(() => {
                                    return {
                                        legacyExpectedInfo: (typeof(OpenAjax) !== 'undefined' && OpenAjax && OpenAjax.a11y && OpenAjax.a11y.ruleCoverage),
                                        expectedInfo: (typeof(UnitTest) !== 'undefined' && UnitTest)
                                    }
                                })
                            }
                        })
                        .then((unitTestInfo) => {
                            // Extract the ruleCoverage object from the unit testcases that is loaded on to the iframe.
                            let expectedInfo = unitTestInfo.expectedInfo;
                            let legacyExpectedInfo = unitTestInfo.legacyExpectedInfo;
                            if (expectedInfo && expectedInfo.ruleIds) {
                                let filtReport = [];
                                for (const issue of report.results) {
                                    delete issue.node;
                                    delete issue.ruleTime;
                                    delete issue.bounds;
                                    delete issue.ignored;
                                    delete issue.level;
                                    issue.value[0] = "INFORMATION";
                                    if (expectedInfo.ruleIds.includes(issue.ruleId)) {
                                        // These are too variable between runs - don't test these
                                        delete issue.snippet;
                                        filtReport.push(issue);
                                    }
                                }
                                filtReport.sort((a, b) => {
                                    let pc = b.path.dom.localeCompare(a.path.dom);
                                    if (pc !== 0) return pc;
                                    return b.ruleId.localeCompare(a.ruleId);
                                })
                                expectedInfo.results.sort((a, b) => {
                                    let pc = b.path.dom.localeCompare(a.path.dom);
                                    if (pc !== 0) return pc;
                                    return b.ruleId.localeCompare(a.ruleId);
                                })
                                expect(filtReport).to.eql(expectedInfo.results);
                            } else if (legacyExpectedInfo) {
                                let expectedInfo = {}
                                let actualInfo = {}
                                for (const item of legacyExpectedInfo) {

                                    if (mapGToRule[item.ruleId] in validList) {
                                        expectedInfo[item.ruleId] = [];
                                        actualInfo[item.ruleId] = [];
                                        for (let xpath of item.failedXpaths) {
                                            xpath = xpath.replace(/([^\]])\//g, "$1[1]/");
                                            if (!xpath.endsWith("]")) xpath += "[1]";
                                            expectedInfo[item.ruleId].push(xpath);
                                        }
                                    } else {
                                        console.log("WARNING: Skipping results for", item.ruleId, "- does not exist in current ruleset");
                                    }
                                }
                                for (const issue of report.results) {
                                    delete issue.node;
                                    delete issue.ruleTime;
                                    delete issue.bounds;
                                    const ruleId = mapRuleToG[issue.ruleId];
                                    if (ruleId in expectedInfo && issue.value[1] !== "PASS") {
                                        actualInfo[ruleId].push(issue.path.dom);
                                    }
                                }
                                for (const ruleId in expectedInfo) {
                                    expectedInfo[ruleId].sort();
                                    actualInfo[ruleId].sort();
                                }
                                expect(actualInfo).to.eql(expectedInfo);
                            }
                        })
                });
            });
        }(unitTestFile));
    }
});
