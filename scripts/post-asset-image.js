// Replace images in post asset with jsDelivr accelerated URLs.
// To enable processing, set env POST_ASSET_IMAGE_CDN to true.

if (!hexo.config.post_asset_folder) {
  return;
}

const chalk = require('chalk');
const rootUrl = 'https://cdn.jsdelivr.net/gh/prinsss/prinsss.github.io@source/source/';

function isRelativePath(url) {
  return !/^(http|https):\/\//.test(url);
}

function jsDelivrReplacer(match, p1, p2) {
  // Process images with relative path
  if (isRelativePath(p2)) {
    const relativeUrl = p2.startsWith('/') ? p2.slice(1) : p2;

    // The "source/_posts/2020/" part, if in post asset folder
    let basePath = '';
    if (relativeUrl.includes(this.slug)) {
      basePath = this.source.replace(/^(.*)\/[^\/]+\.md$/i, '$1/');
    }

    const absoluteUrl = `${rootUrl}${basePath}${relativeUrl}`;
    hexo.log.info('Post asset image: %s -> %s', chalk.yellow(relativeUrl), chalk.green(absoluteUrl));
    return `![${p1}](${absoluteUrl})`;
  }

  return match;
}

// Since using relative image path like "/article-slug/image.png"
// will cause Typora on Linux not showing picture preview,
// I have to write image path without leading slash in Markdown,
// which will then break on rendered web page ("/" means absolute-path reference).
// So I'd like to use "slug/image.png" format in Markdown source,
// and use this script to prepend a leading slash for me automatically.
function localReplacer(match, p1, p2) {
  if (isRelativePath(p2) && !p2.startsWith('/')) {
    p2 = `/${p2}`;
  }
  return `![${p1}](${p2})`;
}

hexo.extend.filter.register('before_post_render', data => {
  data.content = data.content.replace(
    /(?:!\[(.*?)\]\((.*?)\))/g,
    // TODO: dirty quick fix
    process.env.POST_ASSET_IMAGE_CDN === 'true' ? jsDelivrReplacer.bind(data) : localReplacer
  );

  return data;
});
