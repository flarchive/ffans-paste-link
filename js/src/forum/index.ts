import TextEditor from 'flarum/common/components/TextEditor';
import { extend } from 'flarum/common/extend';
import BasicEditorDriver from 'flarum/common/utils/BasicEditorDriver';
import app from 'flarum/forum/app';

import { handlePaste } from './handlePaste';

app.initializers.add('ffans-paste-link', () => {
  extend(TextEditor.prototype, 'buildEditor', function (driver) {
    if (!(driver instanceof BasicEditorDriver)) {
      return;
    }

    driver.el.addEventListener('paste', (event) => {
      handlePaste(event, driver);
    });
  });
});
