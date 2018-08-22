function walk(rootNode)
{
  // Find all the text nodes in rootNode
  var walker = document.createTreeWalker(
    rootNode,
    NodeFilter.SHOW_TEXT,
    null,
    false,
  ),
  node;

  // Modify each text node's value
  while (node = walker.nextNode()) {
    handleText(node);
  }
}

function handleText(textNode) {
  textNode.nodeValue = replaceText(textNode.nodeValue);
}

function getRandomSwear(swearType) {
  var swears = {
    adjectives: [
      "bitch ass",
      "bloody",
      "dumb ass",
      "fucked up",
      "fuckin'",
      "fucking",
      "goddamn",
      "motherfucking",
      "shitty ass",
      "shitty",
      "stupid ass",
    ],
    maleNouns: [
      "ass clown",
      "ass hat",
      "asshole",
      "cuck",
      "fuck ass",
      "fucker",
      "motherfucker",
      "piece of shit",
      "son of a bitch",
    ],
    femaleNouns: [
      "bitch",
      "cunt",
      "fucker",
      "whore",
    ],
    pluralNouns: [
      "assholes",
      "fuckers",
      "motherfuckers",
      "sons of bitches",
    ],
  };

  var randomNumber = Math.floor(Math.random() * swears[swearType].length);

  return swears[swearType][randomNumber];
}

function replaceText(v)
{
    // The
    v = v.replace(/\b(T|t)he(e)?\b/g, "$1he$2 " + getRandomSwear("adjectives"));

    //  Gendered People
    v = v.replace(/\b(M|m)(e|a)n('s)?\b/g, + getRandomSwear("maleNouns"));
    v = v.replace(/\bm(e|a)n('s)?\b/g, + getRandomSwear("maleNouns"));
    v = v.replace(/\b(B|b)oy('s|s(?:')?)?\b/g, "tiny " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\bboy('s|s(?:')?)?\b/g, "tiny " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\b(G|g)uy('s|s(?:')?)?\b/g, + getRandomSwear("maleNouns"));
    v = v.replace(/\bguy('s|s(?:')?)?\b/g, + getRandomSwear("maleNouns"));
    v = v.replace(/\b(W|w)om(e|a)n('s)?\b/g, + getRandomSwear("femaleNouns"));
    v = v.replace(/\bwom(e|a)n('s)?\b/g, + getRandomSwear("femaleNouns"));
    v = v.replace(/\b(G|g)irl('s|s(?:')?)?\b/g,"tiny " + getRandomSwear("femaleNouns") + "$1");
    v = v.replace(/\bgirl('s|s(?:')?)?\b/g, "tiny " + getRandomSwear("femaleNouns") + "$1");
    v = v.replace(/\b(G|g)al('s|s(?:')?)?\b/g, + getRandomSwear("femaleNouns"));
    v = v.replace(/\bgal('s|s(?:')?)?\b/g, + getRandomSwear("femaleNouns"));

    //  Aged People
    v = v.replace(/\bChild('s)?\b/g, "small - " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\bchild('s)?\b/g, "small - " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\bChildren(?:(')s)?\b/g, "mini - " + getRandomSwear("pluralNouns") + "$1");
    v = v.replace(/\bchildren(?:(')s)?\b/g, "mini - " + getRandomSwear("pluralNouns") + "$1");
    v = v.replace(/\b[Tt]een(?:ager)?('s)?\b/g, "proto - " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\bteen(?:ager)?('s)?\b/g, "proto - " + getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\b[Tt]een(?:ager)?(?:(s)\b(')|s\b)/g,  "proto - " + getRandomSwear("pluralNouns") + "$2$1");
    v = v.replace(/\bteen(?:ager)?(?:(s)\b(')|s\b)/g,  "proto - " + getRandomSwear("pluralNouns") + "$2$1");
    v = v.replace(/\b(A|a)dult('s)?\b/g, getRandomSwear("maleNouns") + "$2");
    v = v.replace(/\badult('s)?\b/g, getRandomSwear("maleNouns") + "$1");
    v = v.replace(/\b(A|a)dult(?:(s)\b(')|s\b)/g, getRandomSwear("maleNouns") + "$3$2");
    v = v.replace(/\badult(?:(s)\b(')|s\b)/g, getRandomSwear("maleNouns") + "$2$1");

    return v;
}

// Returns true if a node should *not* be altered in any way
function isForbiddenNode(node) {
    return node.isContentEditable || // DraftJS and many others
    (node.parentNode && node.parentNode.isContentEditable) || // Special case for Gmail
    (node.tagName && (node.tagName.toLowerCase() == "textarea" || // Some catch-alls
                     node.tagName.toLowerCase() == "input"));
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
    var i, node;

    mutations.forEach(function(mutation) {
        for (i = 0; i < mutation.addedNodes.length; i++) {
            node = mutation.addedNodes[i];
            if (isForbiddenNode(node)) {
                // Should never operate on user-editable content
                continue;
            } else if (node.nodeType === 3) {
                // Replace the text for text nodes
                handleText(node);
            } else {
                // Otherwise, find text nodes within the given node and replace text
                walk(node);
            }
        }
    });
}

// Walk the doc (document) body, replace the title, and observe the body and title
function walkAndObserve(doc) {
    var docTitle = doc.getElementsByTagName('title')[0],
    observerConfig = {
        characterData: true,
        childList: true,
        subtree: true
    },
    bodyObserver, titleObserver;

    // Do the initial text replacements in the document body and title
    walk(doc.body);
    doc.title = replaceText(doc.title);

    // Observe the body so that we replace text in any added/modified nodes
    bodyObserver = new MutationObserver(observerCallback);
    bodyObserver.observe(doc.body, observerConfig);

    // Observe the title so we can handle any modifications there
    if (docTitle) {
        titleObserver = new MutationObserver(observerCallback);
        titleObserver.observe(docTitle, observerConfig);
    }
}
walkAndObserve(document);
