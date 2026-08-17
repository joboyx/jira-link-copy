import { defineUnlistedScript } from 'wxt/utils/define-unlisted-script';
import { copyCurrentIssue } from '../lib/run-copy';

export default defineUnlistedScript(() => {
  void copyCurrentIssue();
});
