//=================================================================
// message()
//
// The game has it's own console.  You output messages to the
// player here.  We use the ('pre') style so that \n works!
//=================================================================

// Surround text with specified HTML tag
function addHTMLTag(text, tag) {
    return `<${tag}>${text}</${tag}>`;
}

// Remove specified HTML tag from text
function removeHTMLTag(text, tag) {
    const regex = new RegExp(`<${tag}>|</${tag}>`, 'g');
    return text.replace(regex, '');
}

function addHTMLTagAndClass(text, tag, className) {
    return `<${tag} class="${className}">${text}</${tag}>`;
}

function removeHTMLTagAndClass(text, tag) {
    const regex = new RegExp(`<${tag}(?: class="[^"]*")?>|</${tag}>`, 'g');
    return text.replace(regex, '');
}

//====================================================================
// messageBuffer
//
// One super-long string that represents *every single thing* sent
// to the message area. This will eventually run out of memory but
// it works for this SBA.
//
// Glow effect and hover effect:
//
// The hover effect is created by surrounding each line added with
// the <span></span> and adding a span:hover style in the CSS.  This
// is permanent.
//
// The glow effect is created by surrounding only the last line
// added with <strong class="glow"></strong> and removing it from
// all other lines in the buffer.
//
// So after message() is called, the message buffer looks like this:
//
// <span>Oldest line in buffer</span>
// <span>more text</span>
// <span>more text etc</span>
// <strong class="glow"><span>Newest line added</span></strong>
//
// The next time a line is added, we remove all previous occurances
// of <strong> and </strong>, then add the new text with the glow.
//====================================================================

let messageBuffer = '';
let messageBufferMaxLength = -1;

// Public: Reset the message buffer
function clearMessageBuffer() {
    messageBuffer = '';
}

// Public: Set the max # of lines in the message buffer
function setMessageBufferLength(n) {
    messageBufferMaxLength = n;
}

// Helper: Limit the text to the specified # of lines. If we overflow, only
// keep the last lines

function limitLines(text, maxLines) {

    // Lines is an array of all the text
    const lines = text.split('\n');

    // If # of lines <= # lines allowed
    if (lines.length <= maxLines) {

        // We're good
        return text;

    // Otherwise grab the last # lines and combine them
    } else {
        return lines.slice(-maxLines).join('\n');
    }
}

// Public: Initialize the message <div>
function initMessage(divToAttachTo) {
    let messageArea = document.createElement(`div`);
    messageArea.id = 'messageArea';
    divToAttachTo.appendChild(messageArea);
    
    let messageAreaSubDiv = document.createElement('pre');
    messageAreaSubDiv.id = 'messageAreaSubDiv';
    messageArea.appendChild(messageAreaSubDiv);
}

// Public: Write message to <div>
function message(...args) {

    const messageArea = document.getElementById(`messageArea`);

    // Best way to do it
    // const messageAreaSubDiv = document.getElementById('messageAreaSubDiv');

    // Do it for 5% of the grade
    const messageAreaSubDiv = messageArea.firstChild;

    // Grab all the arguments and convert it to one long string, add <strong class="glow"><span>args</span></strong>
    let s = addHTMLTag(args.join(``), `span`);
    s = addHTMLTagAndClass(s, `strong`, `glow`);

    // Remove the strong tag from all lines in the message buffer
    messageBuffer = removeHTMLTagAndClass(messageBuffer, `strong`);

    // If we have a limit to the # of messages in the buffer
    if (messageBufferMaxLength > 0) {

        // Remove all but the last # of messages
        messageBuffer = limitLines(messageBuffer, messageBufferMaxLength);
    }

    // Add new string to message buffer
    messageBuffer += s + `\n`;

    // Add new string to the message buffer
    messageAreaSubDiv.innerHTML = messageBuffer;

    // Move the scroll bar to the bottom so we can see the most current message
    messageArea.scrollTop = messageArea.scrollHeight;
}

