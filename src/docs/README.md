# Docs

## Development

Run the server:

```bash
$ yarn run docs:serve 4567 <PATH TO particl-market/docs/>
```

## Dev notes

### Icons

`node-slate` includes a default icon set with some icons. For example, adding icons to `aside.notice` would look like this:

```css
aside.notice::before {
  content: "";
  font-family: "Slate";
}

For reference, what to use in `content`:

- search icon: 
- check in circle: 
- info in circle: 
- exclamation mark in circle: 
