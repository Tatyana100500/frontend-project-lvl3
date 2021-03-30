import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import fetch from 'node-fetch';
import { i18n, languages } from './locales/i18nEngine';
import parseLink from './parse.js';

export default () => {
    const form = document.querySelector('[role="form"]');
    const urlInput = document.querySelector('[role="textbox"]');
    const submitButton = document.querySelector('[aria-label="add"]');

    const state = {
        lng: 'detectedLanguage',
        channelsVisible: true,
        form: {
          processState: 'init: ready for processing',
          processError: 'init',
        },
        channels: {
          byId: {},
          allIds: [],
          allChannels: [],
        },
      };

      function validate(url) {
        return yup.string()
          .url('invalidUrl')
          .required('notEmptyString')
          .notOneOf(state.channels.allChannels, 'hasUrlYet')
          .validate(url);
      };  

    const watchedState = onChange(state, (path, value) => {
        switch (path) {
          case 'lng':
            renderLngContent(value);
            break;
          case 'channelsVisible':
            handlePanelVisiability(value);
            break;
          case 'form.processState':
            processStateHandler(value);
            break;
          case 'channels.allIds':
            renderNewChannel(value.pop());
            break;
          case 'channels.allChannels':
            watchChannel(value.pop());
            break;
          case 'error':
            renderFeedback(value);
            break;
          default:
            renderFeedback(`an unexpectable error, please contanct developer with this messageg: path ${path}, value ${value}`);
        }
      });
    
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        formData.get('url');
        const { url } = Object.fromEntries(formData);
        watchedState.form.processState = 'loading';
        validate(url).then(() => fetch(getQueryString(url)))
          .then((response) => response.json())
          .then((data) => {
            const id = _.uniqueId();
            const prasedUrl = parseLink(data.contents);
            const { title, description, postsList } = prasedUrl;
            const date = new Date();
            const newChannel = {
              url, id, title, description, postsList, lastpubDate: date,
            };
            state.channels.byId[id] = newChannel;
            state.channels.allChannels.push(url);
            watchedState.form.processState = 'loaded';
            watchedState.channels.allIds.push(id);
            form.reset();
          })
          .catch((err) => {
            if (err.message === "Cannot read property 'querySelector' of null") {
              watchedState.form.processError = 'notRss';
              watchedState.form.processState = 'failed';
              return;
            } if (err.name === 'FetchError') {
              watchedState.form.processError = 'network';
              watchedState.form.processState = 'failed';
              return;
            }
            watchedState.form.processError = err.message;
            watchedState.form.processState = 'failed';
          });
        });

        urlInput.addEventListener('input', () => {
          watchedState.form.processState = 'filing';
        });
    
};