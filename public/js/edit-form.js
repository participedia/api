import serialize from "./utils/serialize.js";
import loadingGifBase64 from "./loading-gif-base64.js";
import modal from "./modal.js";
import infoIconToModal from "./info-icon-to-modal.js";
import tracking from "./utils/tracking.js";
import languageSelectTooltipForNewEntries from "./language-select-tooltip-for-new-entries.js";
import languageSelectTooltipForNewEntryInput from "./language-select-tooltip-for-new-entry-input";

import submitFormLanguageSelector from "./submit-form-language-selector";
import tabsWithCards from "./tabs-with-cards.js";
//import thing from "../../api/helpers/things";

const editForm = {
  init(args = {}) {
    this.isEditMode = !!document.querySelector("input[name=article_id]")?.value;
    this.originalLanguage = document.querySelector(
      "input[name=original_language]"
    )?.value;
    this.entryId = null;

    if (typeof args == "object" && "richTextEditorList" in args) {
      this.richTextEditorList = args.richTextEditorList;
    }

    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");

    // reference to all forms
    this.localForms = document.querySelectorAll("form[data-local=local]");

    if (!submitButtonEls) return;

    // this is a counter to keep track of publishing attempts
    // if the server returns with a 408 or a 503 (timeout errors)
    // we want to automatically retry a max of MAX_PUBLISH_ATTEMPTS
    // this is a stopgap to improve ux until we fix the underlying server issues.
    this.MAX_PUBLISH_ATTEMPTS = 10;
    this.publishAttempts = 0;

    for (let i = 0; i < submitButtonEls.length; i++) {
      submitButtonEls[i].addEventListener("click", event => {
        // set flag so we can check in the unload event if the user is actually trying to submit the form
        try {
          window.sessionStorage.setItem("submitButtonClick", "true");
        } catch (err) {
          console.warn(err);
        }
        event.preventDefault();
        if (Array.from(event.target.classList).indexOf("button-preview") > -1) {
          tracking.send("draft", "draft_preview", this.entryId);
          this.saveDraft(true);
        } else {
          this.sendFormData();
        }
      });
    }

    // if this page was loaded with the refreshAndClose param, we can close it programmatically
    // this is part of the flow to refresh auth state
    if (window.location.search.indexOf("refreshAndClose") > 0) {
      window.close();
    }

    // do full version click
    const fullVersionButtonEls = document.querySelectorAll(
      ".js-do-full-version"
    );
    const handleFullVersionClick = fullVersionButtonEl => {
      fullVersionButtonEl.addEventListener("click", e => {
        e.preventDefault();
        const articleEl = document.querySelector("[data-submit-type]");
        // change submit type attribute
        articleEl.setAttribute("data-submit-type", "full");
        // update url param
        history.pushState({}, document.title, `${window.location.href}?full=1`);
        // scroll to top
        window.scrollTo(0, 0);
      });
    };
    fullVersionButtonEls.forEach(el => handleFullVersionClick(el));

    this.initOtherLangSelector();
    
    infoIconToModal.init();
    // this.initPinTabs();

    this.formEl = document.querySelector(".js-edit-form");

    this.formEl.addEventListener("change", ev => {
      this.saveDraft(false);
    });

    if (this.localForms) {
      this.initLocalForms();
    }
    // Stopped initialization of new entries due to languageSelectTooltipForNewEntryInput init.
    // languageSelectTooltipForNewEntries.init();
    languageSelectTooltipForNewEntryInput.init();
    submitFormLanguageSelector.init();

    // track if the user's current language is different than the original language
    if(this.isEditMode && this.articleData && typeof this.articleData === 'object'){
      const langKey = Object.keys(this.articleData).find(key => {
        const object = this.articleData[key];
        return object && object.original_language
      });
      if(langKey){
        const articelObj = this.articleData[langKey];
        const entryOrginalLanguage = articelObj.original_language;

        // current language is different than the original language
        if(entryOrginalLanguage !== this.userLocale){
          tracking.send("edit_different_language", "edit_different_language", articelObj.id);
        }
      }


    }
    
  },
  richTextEditorList: {},

  isDraftEntry() {
    try {
      return this.formEl.dataset.datatype === "draft";
    } catch (error) {
      return false;
    }
  },
  initLocalForms() {
    // reference to all forms
    // bind event listener for publish buttons clicks
    const submitButtonEls = document.querySelectorAll("[type=submit]");
    for (let i = 0; i < submitButtonEls.length; i++) {
      const submitBtn = submitButtonEls[i];
      submitBtn.addEventListener("click", () => {
        // submit button clicked, validate forms
        this.validateLocalForms();
      });
    }
    tabsWithCards.init();
  },

  initOtherLangSelector() {
    const userLocale = document.querySelector("input[name=locale]")?.value;
    this.userLocale = document.querySelector("input[name=locale]")?.value;
    let articleId = sessionStorage.getItem("articleId");
    let article_type = sessionStorage.getItem("article_type");
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const sourcePage = urlParams.get("source");

    if (articleId && article_type && sourcePage != "new") {
      location.href = `/${article_type}/${articleId}/edit`;
      sessionStorage.removeItem("articleId");
      sessionStorage.removeItem("article_type");
    }
    const articles =
      document.querySelector("input[name=article_data]")?.value || "{}";
    this.articleData = JSON.parse(articles);
    try {
      this.localePlaceholders = JSON.parse(
        document.querySelector("input[name=locale_placeholders]")?.value || "{}"
      );
    } catch (error) {
      this.localePlaceholders = {};
    }
    this.currentInputValue = "";
    this.entryLocaleData = {
      title: {},
      description: {},
      body: {},
      originalLanguage: userLocale
    };

    if (this.isEditMode) {
      this.initOtherLangSelectorForEditMode();
    }

    const selectInputArr = document.querySelectorAll(
      "select.js-edit-select[name=languages]"
    );
    // const selectorLoaders = document.querySelectorAll(".js-language-select-container");
    const otherLanguageselectorLabel = document.querySelectorAll(
      ".js-other-lang-select"
    );
    const inputFields = document.querySelectorAll(
      ".js-language-select-container+input, .js-language-select-container+textarea"
    );
    const bodyField = document.querySelector(".ql-editor");

    const getFormLanguage = childNodes => {
      var formLanguage = "en";
      for (const [index, item] of childNodes.entries()) {
        if ("className" in item && item.className.includes("js-edit-select")) {
          formLanguage = item.value;
        }
      }

      return formLanguage;
    };

    inputFields.forEach(input => {
      input.addEventListener("focus", evt => {
        this.currentInputValue = evt.target.value;
        this.currentInput = evt.target.name;
      });
      input.addEventListener("keyup", evt => {
        this.currentInputValue = evt.target.value;
        this.currentInput = evt.target.name;
        const formLanguage = getFormLanguage(
          evt.target.previousElementSibling.childNodes
        );

        if (Object.keys(this.entryLocaleData[this.currentInput]).length === 0) {
          this.userLocale = document.querySelector("input[name=locale]").value;
        }

        this.entryLocaleData[this.currentInput][
          formLanguage
        ] = this.currentInputValue;
      });
    });

    otherLanguageselectorLabel.forEach(el => {
      const selectEl = el.nextElementSibling.children[1];
      const inputEl = el.nextElementSibling.nextElementSibling;

      const _disableSelectEl = value => {
        const inputFormLanguage = selectEl.value;
        selectEl.disabled = true;
        selectEl.previousElementSibling.style.display = "initial";

        if (inputFormLanguage !== this.originalLanguage) {
          selectEl.disabled = false;
          selectEl.previousElementSibling.style.display = "none";
        } else if (value.trim().length) {
          selectEl.disabled = false;
          selectEl.previousElementSibling.style.display = "none";
        }
        if (this.currentInput) {
          if (this.entryLocaleData[this.currentInput][this.originalLanguage]) {
            selectEl.disabled = false;
            selectEl.previousElementSibling.style.display = "none";
          }
        }
      };

      const _disableBodySelectEl = innerText => {
        const inputFormLanguage = selectEl.value;
        const value = innerText.replace(/[\r\n]/gm, "");
        selectEl.disabled = true;
        selectEl.previousElementSibling.style.display = "initial";

        // Validate if value is the same as placeholder from localization
        const placeholderText = document.createElement("div");
        placeholderText.innerHTML = this.localePlaceholders["en"].body;

        // If user locale is different in form input language. Then stop the validation
        if (inputFormLanguage !== userLocale) {
          selectEl.disabled = false;
          selectEl.previousElementSibling.style.display = "none";
          return;
        }

        if (placeholderText.innerText === value) {
          selectEl.disabled = true;
          selectEl.previousElementSibling.style.display = "initial";
          return;
        }

        const localeBodyFieldValueEl = document.createElement("div");
        localeBodyFieldValueEl.innerHTML =
          this.entryLocaleData["body"][userLocale] || "";

        if (this.entryLocaleData["body"][userLocale] || !value.trim().length) {
          selectEl.disabled = false;
          selectEl.previousElementSibling.style.display = "none";
          return;
        }

        if (localeBodyFieldValueEl.innerText.trim().length) {
          selectEl.disabled = false;
          selectEl.previousElementSibling.style.display = "none";
          return;
        }
      };

      if (["input", "textarea"].indexOf(inputEl.localName) >= 0) {
        // Toggle select element disable state
        _disableSelectEl(inputEl.value);

        // Listen to keyup event of input element
        inputEl.addEventListener("keyup", e => {
          _disableSelectEl(e.target.value);
        });
      } else if (inputEl.className.includes("ql-toolbar")) {
        // bodyField.innerHTML = this.entryLocaleData.body[selectEl.value];
        this.entryLocaleData["body"][this.userLocale] = bodyField.innerHTML;
        _disableBodySelectEl(bodyField.innerText);
        bodyField.addEventListener("keyup", evt => {
          this.currentInput = "body";
          this.entryLocaleData["body"][this.userLocale] = evt.target.innerHTML;
          bodyField.classList.add("dirty");
          _disableBodySelectEl(bodyField.innerText);
        });

        bodyField.addEventListener("blur", evt => {
          this.saveDraft(false);
        });

        /**
         * Handle rich editor's text change because the current listener only trigger keyup
         */
        if ("body" in this.richTextEditorList) {
          this.richTextEditorList.body.on("editor-change", event => {
            if (event === "text-change") {
              this.currentInput = "body";
              this.entryLocaleData["body"][this.userLocale] =
                bodyField.innerHTML;
              bodyField.classList.add("dirty");
              _disableBodySelectEl(bodyField.innerText);
            }
          });
        }
      }

      el.addEventListener("click", e => {
        e.preventDefault();
        e.target.parentElement.nextElementSibling.classList.toggle(
          "is-visible"
        );
      });
    });

    selectInputArr.forEach(el => {
      el.addEventListener("change", evt => {
        evt.preventDefault();
        const isBody = el.parentElement.nextElementSibling.className.includes(
          "ql-toolbar"
        );
        const inputField = isBody
          ? bodyField
          : el.parentElement.nextElementSibling;

        this.userLocale = evt.target.value;
        this.inputName = isBody
          ? "body"
          : el.parentElement.nextElementSibling.name;
        if (isBody) {
          this.entryLocaleData[this.inputName][this.userLocale] =
            this.entryLocaleData[this.inputName][this.userLocale] ||
            this.localePlaceholders[this.userLocale][this.inputName];
        } else {
          el.parentElement.nextElementSibling.setAttribute(
            "placeholder",
            this.localePlaceholders[this.userLocale][this.inputName] || ""
          );
        }

        if (
          this.entryLocaleData[this.inputName] &&
          this.entryLocaleData[this.inputName][this.userLocale]
        ) {
          if (isBody) {
            inputField.innerHTML = this.entryLocaleData[this.inputName][
              this.userLocale
            ];
          } else {
            inputField.value = this.entryLocaleData[this.inputName][
              this.userLocale
            ];
          }
          // }
        } else {
          this.entryLocaleData[this.inputName][this.userLocale] = "";
          if (isBody) {
            inputField.innerHTML = this.entryLocaleData[this.inputName][
              this.userLocale
            ];
          } else {
            inputField.value = this.entryLocaleData[this.inputName][
              this.userLocale
            ];
          }
        }

        //When the user use the dropdown to change language on EDIT. Track change_edit_language_dropdown
        if(this.isEditMode){
          const articelObj = Object.values(this.articleData).find(val => {
            return val && val.id && val.original_language
          });
          if(articelObj && this.userLocale !== articelObj.original_language){
            tracking.send("change_edit_language_dropdown", "change_edit_language_dropdown", articelObj.id);
          }
        }
      });
    });
  },

  initOtherLangSelectorForEditMode() {
    try {
      const selectInputArr = document.querySelectorAll("select[name=languages");

      for (const locale in this.articleData) {
        if (this.articleData.hasOwnProperty(locale)) {
          const localeArticle = this.articleData[locale];
          this.entryLocaleData.title[locale] = localeArticle.title;
          this.entryLocaleData.description[locale] = localeArticle.description;
          this.entryLocaleData.body[locale] = localeArticle.body;
        }
      }

      selectInputArr.forEach(el => {
        el.classList.add("is-visible");
      });
    } catch (error) {}
  },

  validateLocalForms() {},

  initPinTabs() {
    const tabsContainer = document.querySelector(".js-tab-items");
    const mobileTabsContainer = document.querySelector(
      ".js-tab-select-container"
    );
    document.addEventListener("scroll", e => {
      if (window.scrollY > 25) {
        tabsContainer.classList.add("fixed-language-tab");
      } else {
        tabsContainer.classList.remove("fixed-language-tab");
      }
      if (window.scrollY > 30) {
        mobileTabsContainer.classList.add("fixed-language-tab");
      } else {
        mobileTabsContainer.classList.remove("fixed-language-tab");
      }
    });
  },

  saveDraft(isNeedToPreview = false) {
    if (!this.isDraftEntry()) return;

    const updatedForm = document.querySelector(".js-edit-form");
    var formsData = {};
    const formData = serialize(updatedForm);
    const originalEntry = Object.fromEntries(new URLSearchParams(formData));

    let supportedLanguages;
    try {
      supportedLanguages = JSON.parse(this.formEl.supportedLangs?.value) || [];
    } catch (error) {
      supportedLanguages = [];
    }

    [
      "links",
      "videos",
      "audio",
      "evaluation_links",
      "general_issues",
      "collections",
      "specific_topics",
      "type_method",
      "type_tool",
      "specific_methods_tools_techniques",
      "purposes",
      "approaches",
      "targeted_participants",
      "method_types",
      "tools_techniques_types",
      "participants_interactions",
      "learning_resources",
      "learning_resources",
      "decision_methods",
      "if_voting",
      "insights_outcomes",
      "organizer_types",
      "funder_types",
      "change_types",
      "files",
      "photos",
      "implementers_of_change",
      "evaluation_reports",
    ].map(key => {
      let formKeys = Object.keys(originalEntry);
      let formValues = originalEntry;
      if (!formKeys) return;
      const matcher = new RegExp(`^(${key})\\[(\\d{1,})\\](\\[(\\S{1,})\\])?`);
      let mediaThingsKeys = formKeys.filter(key => matcher.test(key));
      if (mediaThingsKeys.length === 0) {
        originalEntry[key] = [];
      }
      mediaThingsKeys.forEach(thingKey => {
        const thingValue = formValues[thingKey];
        let m = matcher.exec(thingKey);
        if (!m) return;
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === matcher.lastIndex) {
          matcher.lastIndex++;
        }

        if (m[1] === "collections" || m[1] === "specific_methods_tools_techniques") {
          formValues[m[1]] = formValues[m[1]] || [];
          formValues[m[1]].push(thingValue);
          formValues[m[1]] = Array.from(new Set(formValues[m[1]]));
        } else {
          formValues[m[1]] = formValues[m[1]] || [];
          formValues[m[1]][m[2]] =
            formValues[m[1]][m[2]] === undefined ? {} : formValues[m[1]][m[2]];
          formValues[m[1]][m[2]][m[4]] = thingValue;
        }
      });
    });

    if (supportedLanguages && supportedLanguages.length) {
      supportedLanguages.forEach(lang => {
        formsData[lang.key] = {}; // formObject;
        formsData[lang.key]["title"] =
          this.entryLocaleData["title"]?.[lang.key] || "";
        formsData[lang.key]["description"] =
          this.entryLocaleData["description"]?.[lang.key] || "";
        formsData[lang.key]["body"] =
          this.entryLocaleData["body"]?.[lang.key] || "";
      });
    } else {
      formsData = originalEntry;
    }

    const xhr = new XMLHttpRequest();
    const endpoint = isNeedToPreview ? "/saveDraftPreview" : "/saveDraft";
    const apiUrl = `${updatedForm.getAttribute("action")}${endpoint}`;
    xhr.open("POST", apiUrl, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 0) {
        // if user is not logged in
        // this.openAuthWarning();
      } else if (xhr.status === 413) {
        // if file uploads are too large
        this.handleErrors([this.formEl.file_to_large_error.value]);
      } else if (xhr.status === 408 || xhr.status === 503) {
        // handle server unavailable/request timeout errors
        // rather than showing
        if (this.publishAttempts < this.MAX_PUBLISH_ATTEMPTS) {
          this.saveDraft(isNeedToPreview);
          this.publishAttempts++;
        } else {
          this.handleErrors(null);
        }
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
          if (!this.isEditMode) {
            sessionStorage.setItem("articleId", response.articleId);
            sessionStorage.setItem("article_type", response.article_type);
          }

          this.entryId = response.articleId;

          if (response.isPreview) {
            this.handleSuccess(response);
          }
          const saveDraftMessage = this.formEl.querySelector(
            ".js-draft-info-saved"
          );
          saveDraftMessage.style.visibility = "visible";
        } else {
          this.handleErrors(response.errors);
        }
      }
    };

    if (originalEntry.locale) {
      formsData[originalEntry.locale] = originalEntry;
    }

    const requestPayload = {
      ...formsData,
      entryLocales: this.entryLocaleData,
      entryId: this.entryId,
    };
    
    xhr.send(JSON.stringify(requestPayload));
  },

  sendFormData() {
    const formData = serialize(this.formEl);
    const formValue = Object.fromEntries(new URLSearchParams(formData));
    const formObject = Object.fromEntries(new URLSearchParams(formData));

    let formsData = {};
    let supportedLanguages;
    try {
      supportedLanguages = JSON.parse(this.formEl.supportedLangs?.value) || [];
    } catch (error) {
      supportedLanguages = [];
    }

    if ("article_type" in this.formEl) {
      let titleVal = this.entryLocaleData.title[formValue.original_language];
      if(titleVal && typeof titleVal === 'string'){
        titleVal = titleVal.trim();
      }

      if (!titleVal || titleVal === '') {
        this.handleErrors([this.formEl.no_title_error.value]);
        return;
      }
    }

    const captchaResponse = this.formEl.querySelector(".g-recaptcha-response");

    if (captchaResponse && captchaResponse.value.trim() === "") {
      this.handleErrors([this.formEl.captcha_error.value]);
      return;
    }

    [
      "links",
      "videos",
      "audio",
      "evaluation_links",
      "general_issues",
      "type_method",
      "type_tool",
      "specific_methods_tools_techniques",
      "collections",
      "specific_topics",
      "purposes",
      "approaches",
      "targeted_participants",
      "method_types",
      "tools_techniques_types",
      "participants_interactions",
      "learning_resources",
      "learning_resources",
      "decision_methods",
      "if_voting",
      "insights_outcomes",
      "organizer_types",
      "funder_types",
      "change_types",
      "files",
      "photos",
      "implementers_of_change",
      "evaluation_reports",
    ].map(key => {
      let formKeys = Object.keys(formValue);
      let formValues = formValue;
      if (!formKeys) return;
      const matcher = new RegExp(`^(${key})\\[(\\d{1,})\\](\\[(\\S{1,})\\])?`);
      let mediaThingsKeys = formKeys.filter(key => matcher.test(key));
      if (mediaThingsKeys.length === 0) {
        formValue[key] = [];
      }
      mediaThingsKeys.forEach(thingKey => {
        const thingValue = formValues[thingKey];
        let m = matcher.exec(thingKey);
        if (!m) return;
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === matcher.lastIndex) {
          matcher.lastIndex++;
        }

        if (m[1] === "collections" || m[1] === "specific_methods_tools_techniques") {
          formValues[m[1]] = formValues[m[1]] || [];
          formValues[m[1]].push(thingValue);
          formValues[m[1]] = Array.from(new Set(formValues[m[1]]));
        } else {
          formValues[m[1]] = formValues[m[1]] || [];
          formValues[m[1]][m[2]] =
            formValues[m[1]][m[2]] === undefined ? {} : formValues[m[1]][m[2]];
          formValues[m[1]][m[2]][m[4]] = thingValue;
        }
      });
    });

    if (supportedLanguages && supportedLanguages.length) {
      supportedLanguages.forEach(lang => {
        formsData[lang.key] = {}; // formObject;
        formsData[lang.key]["title"] =
          this.entryLocaleData["title"]?.[lang.key] || "";
        formsData[lang.key]["description"] =
          this.entryLocaleData["description"]?.[lang.key] || "";
        formsData[lang.key]["body"] =
          this.entryLocaleData["body"]?.[lang.key] || "";
      });
    } else {
      formsData = formValue;
    }
    const xhr = new XMLHttpRequest();
    const datatype = this.formEl.dataset.datatype;
    const formAction = this.formEl.getAttribute("action");
    xhr.open("POST", `${formAction}?datatype=${datatype}`, true);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onreadystatechange = () => {
      // wait for request to be done
      if (xhr.readyState !== xhr.DONE) return;
      if (xhr.status === 0) {
        // if user is not logged in
        // this.openAuthWarning();
        window.sessionStorage.setItem("submitButtonClick", "true");
        window.location.href = "/logout";
      } else if (xhr.status === 413) {
        // if file uploads are too large
        this.handleErrors([this.formEl.file_to_large_error.value]);
      } else if (xhr.status === 408 || xhr.status === 503) {
        // handle server unavailable/request timeout errors
        // rather than showing
        if (this.publishAttempts < this.MAX_PUBLISH_ATTEMPTS) {
          this.sendFormData();
          this.publishAttempts++;
        } else {
          this.handleErrors(null);
        }
      } else {
        const response = JSON.parse(xhr.response);
        if (response.OK) {
          this.handleSuccess(response);
        } else {
          this.handleErrors(response.errors);
        }
      }
    };

    if (formValue.locale) {
      formsData[formValue.locale] = formValue;
    }

    const requestPayload = {
      ...formsData,
      entryLocales: this.entryLocaleData,
      entryId: this.entryId,
    };

    xhr.send(JSON.stringify(requestPayload));

    // open publishing feedback modal as soon as we send the request
    this.openPublishingFeedbackModal();
  },

  openAuthWarning() {
    const content = `
      <h3>It looks like you're not logged in...</h3>
      <p>Click the button below to refresh your session in a new tab, then you'll be redirected back here to save your changes.</p>
      <a href="/login?refreshAndClose=true" target="_blank" class="button button-red js-refresh-btn">Refresh Session</a>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
    document.querySelector(".js-refresh-btn").addEventListener("click", () => {
      try {
        window.sessionStorage.setItem("submitButtonClick", "false");
      } catch (err) {
        console.warn(err);
      }
      modal.closeModal();
    });
  },

  openPublishingFeedbackModal() {
    const content = `
      <div class="loading-modal-content">
        <h3>Publishing</h3>
        <img src=${loadingGifBase64} />
      </div>
    `;
    modal.updateModal(content);
    modal.openModal("aria-modal");
  },

  handleSuccess(response) {
    if (response.user) {
      // track user profile update and redirect to user profile
      tracking.sendWithCallback("user", "update_user_profile", "", () => {
        // redirect to user profile page
        location.href = `/user/${response.user.id}`;
      });
    } else if (response.article) {
      const isNew = this.formEl.getAttribute("action").indexOf("new") > 0;
      const eventAction = isNew ? "create_new_article" : "update_article";
      const eventLabel = response.article.type;

      // track publish action then redirect to reader page
      tracking.sendWithCallback("articles", eventAction, eventLabel, () => {
        // redirect to article reader page
        location.href = `/${response.article.type}/${response.article.id}`;
      });
    }
  },

  errorModalHtml(errors) {
    if (!Array.isArray(errors)) {
      return `<h3>Sorry, something went wrong. Please try again.</h3>`;
    } else {
      const errorsHtml = errors
        .map(error => {
          if (error.errors) {
            return error.errors.map(err => `<li>${err}</li>`).join("");
          } else {
            return error;
          }
        })
        .join("");
      return `
        <h3>${this.formEl.recaptcha_issues.value}</h3>
        <ul>
          ${errorsHtml}
        </ul>
      `;
    }
  },

  handleErrors(errors) {
    const content = this.errorModalHtml(errors);
    modal.updateModal(content);
    modal.openModal("aria-modal", { showCloseBtn: true });
  },
};

export default editForm;
