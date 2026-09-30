# FFans Paste Link

[![License](https://img.shields.io/packagist/l/ffans/paste-link.svg?label=license)](https://raw.githubusercontent.com/ffans/paste-link/main/LICENSE) [![Flarum](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fffans%2Fpaste-link%2Fmain%2Fcomposer.json&query=%24.require%5B%22flarum%2Fcore%22%5D&label=Flarum)](https://docs.flarum.org/2.x/) [![Version](https://img.shields.io/github/v/tag/ffans/paste-link?filter=v1.*&sort=semver&label=version)](https://github.com/ffans/paste-link/releases) [![Release Date](https://img.shields.io/github/release-date/ffans/paste-link.svg?display_date=published_at&label=release%20date)](https://github.com/ffans/paste-link/releases/latest) [![Total Downloads](https://img.shields.io/packagist/dt/ffans/paste-link.svg?label=downloads)](https://packagist.org/packages/ffans/paste-link/stats) [![Monthly Downloads](https://img.shields.io/packagist/dm/ffans/paste-link.svg?label=downloads)](https://packagist.org/packages/ffans/paste-link/stats)

A [Flarum](https://flarum.org) extension. Turns selected text into a Markdown link when paste a URL. This is a tiny quality-of-life enhancement for the default Markdown composer. No settings, no permissions, just one paste listener inside the default composer.

> [FoF Rich Text](https://discuss.flarum.org/d/38789) for Flarum 2.x provides similar paste-link behavior as part of its full rich-text editing experience. Paste Link is intended for communities that prefer default Markdown composer or still run Flarum 1.x.

## Features

Select `Flarum` then paste `https://flarum.org`, results:

```markdown
[Flarum](https://flarum.org)
```

## Rules

Use the same behavior of JetBrains IDEA, avoid wrapping selections that overlap recognized inline Markdown links, images, or plain links.

e.g.

- `^` marks the selected characters.
- `✅️` means the selection will convert into a Markdown link.
- `❌️` means the extension leaves the paste to the editor's default behavior.

```markdown
[Flarum](https://flarum.org) ❌️
^^^^^^

abc [Flarum](https://flarum.org) xyz ❌️
^^^^^^^^^^^^^

def opq ✅️
^^^

https://jetbrains.com/abc.html ❌️
^^^^^^^^^^^^

www.jetbrains.com/abc.html ❌️
^^^^^^^^^^^^

jetbrains.com/abc.html ✅️
^^^^^^
```

## Requirements

| Flarum | Extension Version | Branch |
|--------|-------------------|--------|
| 2.x    | `1.0.0`           | `main` |
| 1.8    | `1.0.0`           | `main` |

## Installation

Install with Composer:

```sh
composer require ffans/paste-link:"*"
```

## Updating

```sh
composer update ffans/paste-link
php flarum cache:clear
```

## Links

- [GitHub](https://github.com/ffans/paste-link)
- [Packagist](https://packagist.org/packages/ffans/paste-link)
- [Discuss](https://discuss.flarum.org/d/39950)
- [Discuss in Chinese](https://discuss.flarum.org.cn/d/16574)

## License

[MIT](LICENSE.md).
