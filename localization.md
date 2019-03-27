# Localization

### Rendering localized text in HBS templates
Use the `t` helper function and pass the key of the string you wish to render.
```
<p>{{t "research.surveys.p1"}}</p>
```

### Key Best Practices
- for single words and short titles or phrases, use the actual text as the key.
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

  "about.ckmc.title": "Communications & Knowledge Mobilization Committee",

  "research.tagline": "Participedia is guided by the research question: What kinds of participatory processes work best, for what purposes, and under what conditions?",
}
```

