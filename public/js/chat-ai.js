const chatAi = {
  init() {

    const messageUsBtn = document.getElementById('message-us-btn');
    const chatPopup = document.getElementById('chat-popup');
    const closePopupBtn = document.getElementById('close-popup');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
   
    messageUsBtn.addEventListener('click', e => {
      chatPopup.style.display = 'block';
      messageUsBtn.style.display = 'none';
    });

    closePopupBtn.addEventListener('click', e => {
      messageUsBtn.style.display = 'block';
      chatPopup.style.display = 'none';

    });

    sendButton.addEventListener('click', e => {
      this.sendMessage();
    });

    userInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') {
          this.sendMessage();
      }
    });

  },

  sendMessage() {
    const userInput = document.getElementById('user-input');

    const message = userInput.value.trim();
    if (message !== '') {
        this.appendMessage(message);
        userInput.value = '';
        // Here you can add code to send the message to your chatbot backend
    }
  },

  appendMessage(message) {
    if(message !== null || message !== '' || message !== undefined){
      const welcomeMsg = document.getElementById(' js-chat-welcome-msg');
      welcomeMsg.style.display = 'none';
    }
    const chatBox = document.getElementById('chat-box');
    const messageElement = this.createMechatMsgParentssageDiv(message, {});
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom
  },

  createMechatMsgParentssageDiv(message, user){
    // create a div element for a chat box
    const chatMsgParent = document.createElement('div');
    chatMsgParent.classList.add('chat-message-box'); // flex
    // **************** [START] start element (include avater)*********
    // avater item
    // append by chatMsgParent
    const chatAvater = document.createElement('div');
    chatAvater.classList.add('chat-avater-item'); // flex-shrink-0 flex flex-col relative items-end
    
    // avater div
    // append by chatAvater
    const avaterDiv = document.createElement('div'); // width & height  1.5rem; | border-radius 9999px
    avaterDiv.classList.add('chat-avater');

    // append by avaterDiv
    // only for style purpose
    const avaterRelativeFlex = document.createElement('div');
    avaterRelativeFlex.classList.add('chat-relative-flex');
    
    // image
    // .author-profile-image-initial
    const authorProfileImageInit = document.createElement('div');
    authorProfileImageInit.classList.add('author-profile-image-initial');
    authorProfileImageInit.innerText = 'TS';

    // const imgEl = document.createElement('img');
    // imgEl.src = user.photoUrl ? user.photoUr : 'https://www.gravatar.com/avatar/0a86b9188ff3a5b83959f8688f08f1ba?s=40&d=blank';
    // imgEl.alt = '';

    // avaterRelativeFlex.appendChild(imgEl);
    avaterRelativeFlex.appendChild(authorProfileImageInit);
    avaterDiv.appendChild(avaterRelativeFlex);
    chatAvater.appendChild(avaterDiv);
    // **************** [END] start element (include avater) *********

    // **************** [START] end element *********
    //append by chatMsgParent
    const chatContent = document.createElement('div'); // flex | flex-direction: column | relative
    chatContent.classList.add('chat-content-item');

    // div to show the owner name
    // append by chatContent
    const chatAuthor = document.createElement('div'); // You | Ai weight 600
    chatAuthor.classList.add('chat-author'); // You | Ai
    chatAuthor.innerText = user.name ? user.name : 'You';
    // text div flex
    //append by chatContent
    const chatTextFlex = document.createElement('div'); // flex & flex-direction: column;
    chatTextFlex.classList.add('chat-text-flex'); // 

    // text div flex
    //append by chatTextFlex
    const chatTextDiv = document.createElement('div'); // .break-words & .whitespace-pre-wrap .overflow-x-auto;
    chatTextDiv.classList.add('chat-text-msg'); //

    // message div
    // append by chatTextDiv
    const chatText = document.createElement('div');
    chatText.classList.add('chat-text-base'); //
    chatText.innerText = message;

    //append 
    chatTextDiv.appendChild(chatText);
    chatTextFlex.appendChild(chatTextDiv);
    chatTextFlex.appendChild(chatTextDiv);
    chatContent.appendChild(chatAuthor);
    chatContent.appendChild(chatTextFlex);
    // chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to bottom

    chatMsgParent.appendChild(chatAvater);
    chatMsgParent.appendChild(chatContent);

    return chatMsgParent;
  }
};

export default chatAi;
