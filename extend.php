<?php

/*
 * This file is part of ffans/paste-link.
 *
 * Copyright (c) 2026 .
 *
 * For the full copyright and license information, please view the LICENSE.md
 * file that was distributed with this source code.
 */

namespace FFans\PasteLink;

use Flarum\Extend;
use Flarum\Foundation\Application;

return [
    // Assets
    (new Extend\Frontend('forum'))
        ->js(__DIR__ . (version_compare(Application::VERSION, '2.0.0-dev', '<')
                ? '/js/dist/forum-1.x.js'
                : '/js/dist/forum.js')),
];
