# Localization

## Backend

### How to add new keys to the db


----------

## Front-End

### Templates expect each route that returns html to return a static key on the json response object.

```
{
  "static": {
    "stringKey": "stringValue",
    ...
  },
  ...
}
```

### Handlebars Helper
{{t static key}}

### Key Best Practices
- for single words and short titles or phrases, use the actual text as the key
```
"static": {
  "Cases": "Cases",
  "Publish": "Publish",
  "Project Director and Co-Founder": "Project Director and Co-Founder",
}
```

- for page/section specific text use dot-notation to name space pages/sections
```
"static": {
  "about.cases.p1": "Cases are events and instances of participatory politics and governance of all shapes and sizes.",
  "about.cases.p2": "",
  "about.tagline": "A global community sharing knowledge and stories about public participation",
  "research.tagline": "Some other tag line",
}
```

