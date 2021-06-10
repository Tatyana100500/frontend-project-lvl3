import 'bootstrap';
import 'bootstrap/dist/js/bootstrap.js';
import i18next from 'i18next';
import * as yup from 'yup';
import onChange from 'on-change';
import _ from 'lodash';
import fetch from 'node-fetch';
import { i18n, languages } from './locales/textOrg.js';
import parseLink from './parse.js';
import debug from 'debug';

const log = debug('page-loader');
export default () => {
    const form = document.querySelector('[role="form"]');
    const urlInput = document.querySelector('[role="textbox"]');
    const submitButton = document.querySelector('[aria-label="add"]');
    const siteHeader = document.getElementById('main-header');
    const siteDescription = document.querySelector('[role="banner-role"]');
    const feedsHeader = document.querySelector('[id="feeds-header"]');
    const lngToggler = document.querySelector('[role="switch"]');
    const inputExmaple = document.querySelector('[role="complementary"]');
    const footerText = document.querySelector('[role="contetntinfo"]');
    console.log('footerText', footerText)
    const panelButton = document.querySelector('[data-toggle="channels-view"]');
    const modalLinkButton = document.querySelector('[role="post-link"]');
    const modalCloseButton = document.querySelector('[role="close-modal"]');
    const feedsContainer = document.querySelector('[role="feed"]');
    const postsContainer = document.querySelector('[role="list"]');
    const feedbackDiv = document.querySelector('[role="document"]');
    const feedButtons = postsContainer.getElementsByTagName('button');
    const modalTitle = document.querySelector('[class="modal-title"]');
    const modalBody = document.querySelector('[class="modal-body"]');
    const routes = {
        queryPath: () => 'https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=',
      };
    const getQueryString = (queryParametr) => `${routes.queryPath()}${encodeURIComponent(queryParametr)}`;

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
      const elemArr = {
        siteHeader,
        siteDescription,
        feedsHeader,
        lngToggler,
        urlInput,
        submitButton,
        inputExmaple,
        footerText,
        modalLinkButton,
        modalCloseButton,
      };
      function renderFeedback(info) {
        switch (info) {
          case 'loading':
            feedbackDiv.classList.remove('text-danger');
            feedbackDiv.classList.add('text-success');
            feedbackDiv.textContent = i18next.t('loading');
            break;
          case 'invalidUrl':
          case 'notEmptyString':
          case 'hasUrlYet':
          case 'notRss':
          case 'network':
            feedbackDiv.classList.remove('text-success');
            feedbackDiv.classList.add('text-danger');
            feedbackDiv.textContent = i18next.t(info);
            break;
          case 'filing':
            feedbackDiv.textContent = '';
            break;
          case 'loaded':
            feedbackDiv.classList.remove('text-danger');
            feedbackDiv.classList.add('text-success');
            feedbackDiv.textContent = i18next.t('loaded');
            break;
          default:
            feedbackDiv.classList.remove('text-success');
            feedbackDiv.classList.add('text-danger');
            feedbackDiv.textContent = info;
        }
      }
      function processStateHandler(processState) {
        switch (processState) {
          case 'init: ready for processing':
            submitButton.disabled = false;
            break;
          case 'loading':
            submitButton.disabled = true;
            renderFeedback(processState);
            urlInput.setAttribute('readonly', 'readonly');
            break;
          case 'failed':
            submitButton.disabled = false;
            urlInput.removeAttribute('readonly');
            renderProcessErrors(state.form.processError);
            break;
          case 'filing':
            renderFeedback(processState);
            break;
          case 'loaded':
            submitButton.disabled = false;
            urlInput.removeAttribute('readonly');
            renderFeedback(processState);
            break;
          default:
            renderFeedback(`an unexpectable error, please contanct developer with this secret messageg: ${processState}`);
        }
      }
    
      function handlePanelVisiability(vision) {
        feedsContainer.classList.toggle('invisible');
        handlePanelButtonContnetn(vision);
      }
    
      function changeModalContent(modalState) {
        const { postTitle, postDescription, postLink } = modalState;
        modalTitle.textContent = postTitle;
        modalBody.textContent = postDescription;
        modalLinkButton.href = postLink;
      }
    
      function renderProcessErrors(err) {
        renderFeedback(err);
      }    
    
      function updateLngContent(elemName, elem) {
        const transletEleme = elem;
        console.log('??????????//', elemName, elem, transletEleme)
        transletEleme.textContent = i18next.t(elemName);
      }
    
      function handlePanelButtonContnetn(vision) {
        return vision === true ? updateLngContent('panelClose', panelButton) : updateLngContent('panelButton', panelButton);
      }
    
      function renderLngContent(lng) {
        i18next.changeLanguage(lng);
        Object.entries(elemArr).forEach(([propertyName, elem]) => {
            console.log('!!!!!!!!!!!!!!!', propertyName, elem);
            updateLngContent(propertyName, elem)});
        handlePanelButtonContnetn(state.channelsVisible);
        if (state.form.processState !== 'failed' && state.form.processState !== 'init: ready for processing') {
          feedbackDiv.textContent = i18next.t(state.form.processState);
        } else {
          feedbackDiv.textContent = i18next.t(state.form.processError);
        }
        Array.from(feedButtons).map((feedButton) => updateLngContent('preview', feedButton));
        if (feedsContainer.children.length === 0) {
          feedsContainer.textContent = i18next.t('feeds');
        }
      }
    
      i18n().then(() => renderLngContent('ru'));

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
      function creatPostLi(post) {
        const {
          pubDate, postTitle, postDescription, postLink,
        } = post;
        const feedLi = document.createElement('li');
        feedLi.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'm-2');
        const postBody = document.createElement('div');
        postBody.classList.add('d-flex', 'flex-column', 'ml-5');
        const postHeader = document.createElement('h5');
        postHeader.classList.add('card-title');
        postBody.appendChild(postHeader);
        const feedLink = document.createElement('a');
        feedLink.setAttribute('target', '_blank');
        feedLink.href = postLink;
        feedLink.textContent = postTitle;
        feedLink.classList.add('font-weight-bold');
        feedLink.addEventListener('click', (e) => {
          e.preventDefault();
          feedLink.classList.remove('font-weight-bold');
          window.open(postLink);
        });
        postHeader.appendChild(feedLink);
        const feedDescription = document.createElement('p');
        const pubDateSlioceToElements = 5;
        const publicationInfo = pubDate.toString().split(' ').slice(0, pubDateSlioceToElements).join(' ');
        const previewMaxLenght = 200;
        const previewInfo = `${postDescription.slice(0, previewMaxLenght).trim()}...`;
        feedDescription.innerHTML = `${previewInfo} / ${publicationInfo}`;
        feedDescription.classList.add('text-muted');
        postBody.appendChild(feedDescription);
        const feedButton = document.createElement('button');
        feedButton.classList.add('btn', 'btn-primary', 'btn-small', 'w-100');
        feedButton.textContent = i18next.t('preview');
        feedButton.setAttribute('type', 'button');
        feedButton.setAttribute('data-toggle', 'modal');
        const buttonId = '#modal';
        feedButton.setAttribute('data-target', buttonId);
        feedButton.addEventListener('click', () => {
          feedLink.classList.remove('font-weight-bold');
          changeModalContent({
            postTitle,
            postDescription,
            postLink,
          });
        });
        postBody.appendChild(feedButton);
        feedLi.appendChild(postBody);
    
        return feedLi;
      }
    
      function renderNewChannel(channeId) {
        const { title, description, postsList } = state.channels.byId[channeId];
        if (feedsContainer.children.length === 0) {
          const tatrgetDiv = feedsContainer;
          tatrgetDiv.textContent = '';
        }
        const newChannelHeader = document.createElement('h3');
        newChannelHeader.textContent = title;
        newChannelHeader.classList.add('display-6');
    
        const channelDescription = document.createElement('small');
        channelDescription.textContent = description;
        channelDescription.classList.add('text-muted');
    
        const newChannel = document.createElement('li');
        newChannel.classList.add('list-group-item');
        newChannel.appendChild(newChannelHeader);
        newChannel.appendChild(channelDescription);
        const postsUl = document.createElement('ul');
        postsUl.setAttribute('id', channeId);
        postsContainer.appendChild(postsUl);
        postsList.forEach((post) => postsUl.appendChild(creatPostLi(post)));
        return feedsContainer.appendChild(newChannel);
      }
    
      function watchChannel(channelId) {
        const {
          url, title, description, lastpubDate,
        } = state.channels.byId[channelId];
        fetch(getQueryString(url)).then((response) => response.json())
          .then((data) => parseLink(data.contents))
          .then((currentRssData) => {
            const { postsList } = currentRssData;
            const newPosts = postsList.filter((post) => post.pubDate > lastpubDate);
            return newPosts.length !== 0 ? postsList : false;
          })
          .then((postsList) => {
            if (postsList !== false) {
              const newPubDate = new Date();
              state.channels.byId[channelId] = {
                url, title, description, postsList, newPubDate,
              };
              renderNewChannel(channelId);
            }
          });
        return setTimeout(watchChannel, 5000, channelId);
      }
    
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
        panelButton.addEventListener('click', () => {
            const channelPanelState = state.channelsVisible;
            watchedState.channelsVisible = !channelPanelState;
          });
        
          const handleSwitchLanguage = (e) => {
            const lng = e.target.attributes['data-lng'].value;
            watchedState.lng = lng;
          };
        
          languages.forEach((lng) => {
            const lngButton = document.querySelector(`[data-lng="${lng}"]`);
            return lngButton.addEventListener('click', handleSwitchLanguage);
          });
    
};