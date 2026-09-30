# FFans Paste Link · 粘贴链接

[![许可证](https://img.shields.io/packagist/l/ffans/paste-link.svg?label=许可证)](https://raw.githubusercontent.com/ffans/paste-link/main/LICENSE) [![Flarum](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fffans%2Fpaste-link%2Fmain%2Fcomposer.json&query=%24.require%5B%22flarum%2Fcore%22%5D&label=Flarum)](https://docs.flarum.org/2.x/) [![最新版本](https://img.shields.io/github/v/tag/ffans/paste-link?filter=v1.*&sort=semver&label=最新版本)](https://github.com/ffans/paste-link/releases) [![发布日期](https://img.shields.io/github/release-date/ffans/paste-link.svg?display_date=published_at&label=发布日期)](https://github.com/ffans/paste-link/releases/latest) [![总下载量](https://img.shields.io/packagist/dt/ffans/paste-link.svg?label=总下载量)](https://packagist.org/packages/ffans/paste-link/stats) [![月下载量](https://img.shields.io/packagist/dm/ffans/paste-link.svg?label=月下载量)](https://packagist.org/packages/ffans/paste-link/stats)

[Flarum](https://flarum.org) 扩展程序。选中文本后粘贴网址，自动转换成 Markdown 超链接。

> [FoF Rich Text](https://discuss.flarum.org/d/38789-friendsofflarum-rich-text-wysiwyg) 富文本编辑器也为 Flarum 2.x 提供同样的功能。如果你使用 Flarum 1.x，或默认 Markdown 编辑器，可以采用本扩展。

## 功能

选中 `Flarum` 并粘贴 `https://flarum.org`，生成：

```markdown
[Flarum](https://flarum.org)
```

## 规则

粘贴规则参考了 JetBrains IDEA 的行为，选取只要与行内链接、图片链接、纯文本链接重叠，就不转换。

示例

- `^` 表示选中的字符。
- `✅️` 表示将选区转换成 Markdown 链接。
- `❌️` 表示不转换，使用编辑器默认粘贴行为。

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

## 要求

| Flarum | 扩展版本 | 分支   |
|--------|----------|--------|
| 2.x    | `1.0.0`  | `main` |
| 1.8    | `1.0.0`  | `main` |

## 安装

使用 Composer:

```sh
composer require ffans/paste-link:"*"
```

## 更新

```sh
composer update ffans/paste-link
php flarum cache:clear
```

## 链接

- [GitHub](https://github.com/ffans/paste-link)
- [Packagist](https://packagist.org/packages/ffans/paste-link)
- [英文社区](https://discuss.flarum.org/d/39950)
- [中文社区](https://discuss.flarum.org.cn/d/16574)

## 许可证

[MIT](LICENSE.md)。
