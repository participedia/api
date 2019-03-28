# Localization

### Rendering localized text in HBS templates
Use the `t` helper function and pass the key of the string you wish to render.
```
<p>{{t "research.surveys.p1"}}</p>
```

For strings that require interpolation of variables, use the `__` function in the template and `%s` in the string definition to represent each variable you are passing in:

string definition in en.js:
```
"about.cases.example": "For example, this case on %sParis’s 2017 Participatory Budget%s
is one of over 160 case entries documenting the use of participatory methods to give
citizens stronger influence over the distribution of public resources.",
```

in HBS template:
```
{{{__ "about.cases.example" "<a href='/case/5008'>" "</a>"}}}
```


### Key Best Practices
- for single words and short titles or phrases, use the actual text as the key.
```
{
  "Cases": "Cases",
  "Publish": "Publish",
  "Project Director and Co-Founder": "Project Director and Co-Founder",
}
```

- for page/section specific text use dot-notation to name space pages/sections
```
{
  "about.cases.p1": "Cases are events and instances of participatory politics
   and governance of all shapes and sizes.",

  "about.ckmc.title": "Communications & Knowledge Mobilization Committee",

  "research.tagline": "Participedia is guided by the research question:
   What kinds of participatory processes work best, for what purposes,
   and under what conditions?",
}
```

###Working with PhraseApp

####When keys and translations are changed via code
When changes are made to the `locales/*.js` files, they will need to be synced/updated with PhraseApp. The best way to do this is to use the PhraseApp CLI to push the changes to a new branch on PhraseApp. First, make sure you have the phraseapp cli installed:

```
$ brew tap phrase/brewed
$ brew install phraseapp
```
More info on cli installation can be found here: https://help.phraseapp.com/phraseapp-for-developers/phraseapp-client/installation

Then use the cli to push a new branch with your changes.
`phraseapp push --branch <branchname>`

Once this is done goto phraseapp.com and select the Participedia project, then go to the branches tab. From there you can choose to `Compare & Merge` the branch. Using this branching flow will prevent us from overwriting any updates or translations that have been completed via the PhraseApp editor.

####When keys and translations are changed via the PhraseApp.com editor
When changes have been made via the PhraseApp editor we will need to sync them to our github repo and master branch. To do this go to phraseapp.com and select the Participedia project, then go to the Locales tab. From here we can choose the `Export to GitHub as pull request` option from the `GitHub Sync` select menu. Once a PR is created we can review and merge to master to see the updated translations.
