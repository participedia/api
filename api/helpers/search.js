const is_whitespace = str => /^\s+$/.test(str);

const is_word = str => /^[a-z]+$/.test(str);

const pre_word_connector = (last_token, inside_quotes) => {
  if (last_token === "WORD") {
    if (inside_quotes) {
      return "<->";
    } else {
      return "&";
    }
  } else {
    return "";
  }
};

const tokenize = function*(query, inside_quotes = false) {
  let re = /".*?"|[a-z]+|<->|&|\||\!|\(|\)/g;
  let last_token = null;
  let tokenObj = null;
  while ((tokenObj = re.exec(query)) !== null) {
    let token = tokenObj[0];
    if (token[0] === '"') {
      yield pre_word_connector(last_token, inside_quotes);
      for (t of tokenize(token.slice(1, -1), true)) {
        yield t;
      }
      last_token = "WORD";
    } else if (token === "and" || token === "&") {
      last_token = "CONNECT";
      yield "&";
    } else if (token === "or" || token === "|") {
      last_token = "CONNECT";
      yield "|";
    } else if (token === "not" || token === "!") {
      if (last_token === "WORD") {
        yield "&"; // cannot have a bare NOT, needs a connector
      }
      last_token = "CONNECT";
      yield "!";
    } else if (token === "<->") {
      last_token = "CONNECT";
      yield token;
    } else if (token === "(") {
      yield pre_word_connector(last_token, inside_quotes);
      last_token = "CONNECT";
      yield token;
    } else if (token === ")") {
      last_token = "WORD";
      yield token;
    } else if (is_word(token)) {
      yield pre_word_connector(last_token, inside_quotes);
      last_token = "WORD";
      yield token;
    }
  }
};

const preparse_query = function(userQuery) {
  return [...tokenize(userQuery.toLowerCase())].join("");
};

module.exports = {
  preparse_query,
  tokenize
};
