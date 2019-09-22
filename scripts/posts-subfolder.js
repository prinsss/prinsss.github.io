// posts-subfolder
hexo.extend.filter.register('post_permalink', permalink => {
  // Organize posts in these subfolders,
  // but don't add the subfolder name to generated post links.
  const folders = ['2015', '2016', '2017', '2018'];

  for (const name of folders) {
    if (permalink.startsWith(`${name}/`)) {
      // Replace first occurrence
      return permalink.replace(`${name}/`, '');
    }
  }
});
