---
title: '开启 Wordpress 评论回复邮件通知'
date: '2015-07-27 01:52:47'
updated: '2015-08-29 00:35:44'
categories: 技术
tags:
  - WordPress
  - PHP
---


以前就注意到 wp 有这个功能了，可以在评论被回复时发邮件通知评论者，是个增强用户粘性的好方法。然而窝这犄角旮旯的能来几个人就不错了，哪有人闲得蛋疼来评论呢，所以咱也就没在意。

然而就在昨天，窝的博客迎来了激动人心的历史上的跨越：

### 有窝不认识的人发表了评论！

woc 窝当时心里真激动啊，这是评论者的一小步是人博客的一大步啊[![20150715224933](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)](https://img.prin.studio/images/2015/07/2015-07-15_14-49-46.jpg)

窝当时就抄起键盘准备回复，突然一想没有邮件通知玩个卵啊

遂搜索了一大堆方法，其中也踩了不少坑，在这里记录一下。

原生 wp 的邮件发送是使用 php 的 mail() 函数，这点在后台登陆页的忘记密码处可以得知。你可以在 [探针](http://www.yahei.net/) 里查看你的 mail() 函数是否启用。使用 mail() 函数的方法请自行搜索。

首先去找一个启用 SMTP 的插件，这里推荐 Easy WP SMTP。配置不多说，请自行搞到能收到测试邮件。

如果你的主题自带回复提醒的话现在就可以测试一下了 // [坑1](#1)

对于没有这个功能主题，打开开主题的 function.php ，在合适位置加入如下代码：

//评论回复邮件 function comment_mail_notify($comment_id) { $comment = get_comment($comment_id); $parent_id = $comment->comment_parent ? $comment->comment_parent : ''; $spam_confirmed = $comment->comment_approved; if (($parent_id != '') && ($spam_confirmed != 'spam')) { $wp_email = 'reply@' . preg_replace('#^www\.#', '', strtolower($_SERVER['SERVER_NAME'])); //发件人邮件地址 $to = trim(get_comment($parent_id)->comment_author_email); $subject = '有人回复你在 ' . get_option("blogname") . ' 上的评论辣'; //酌情更改 $message = '<table style="width: 99.8%;height:99.8% "><tbody><tr><td style="background:#FAFAFA url(https://files.prinzeugen.net/Resources/pics/mail_background.png)"><div style="background-color:white;border-top:2px solid #12ADDB;box-shadow:0 1px 3px #AAAAAA;line-height:180%;padding:0 15px 12px;width:500px;margin:50px auto;color:#555555;font-family:Century Gothic,Trebuchet MS,Hiragino Sans GB,微软雅黑,Microsoft Yahei,Tahoma,Helvetica,Arial,SimSun,sans-serif;font-size:12px;"> <h2 style="border-bottom:1px solid #DDD;font-size:14px;font-weight:normal;padding:13px 0 10px 8px;"><span style="color: #12ADDB;font-weight: bold;">> </span>您在<a style="text-decoration:none;color: #12ADDB;" href="' . get_option('home') . '"> ' . get_option('blogname') . ' </a>博客上的留言有回复啦！</h2> <div style="padding:0 12px 0 12px;margin-top:18px"><p>' . trim(get_comment($parent_id)->comment_author) . ' ，您曾在文章《' . get_the_title($comment->comment_post_ID) . '》上发表评论:</p> <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">' . nl2br(get_comment($parent_id)->comment_content) . '</p> <p>' . trim($comment->comment_author) . ' 给您的回复如下:</p> <p style="background-color: #f5f5f5;border: 0px solid #DDD;padding: 10px 15px;margin:18px 0">' . nl2br($comment->comment_content) . '</p> <p>您可以点击 <a style="text-decoration:none; color:#12addb" href="' . htmlspecialchars(get_comment_link($parent_id)) . '">查看回复的完整內容 </a>。欢迎再次光临 <a style="text-decoration:none; color:#12addb" href="' . get_option('home') . '">' . get_option('blogname') . ' </a>。</p> <p>此邮件由系统自动发出，就算你回复了窝也不会回复你哟 ﾟ∀ﾟ)σ</p> </div></div></td></tr></tbody></table>'; $from = "From: \"" . get_option('blogname') . "\" <$wp_email>"; $headers = "$from\nContent-Type: text/html; charset=" . get_option('blog_charset') . "\n"; wp_mail( $to, $subject, $message, $headers ); //echo 'mail to ', $to, '<br/> ' , $subject, $message; // for testing } } add_action('comment_post', 'comment_mail_notify'); //窝还以为设置完 SMTP 后还要一些别的设置，没想到这里用了 wp 钩子就已经解决了（扶额

代码的意思看看函数名变量名之类的就可以懂了吧~

初次使用请将代码底部的 echo 反注释，方便调试

成功后发送的邮件大概是这样的：

<table style="width: 99.8%; height: 99.8%;"><tbody><tr><td style="background: #FAFAFA url('https://files.prinzeugen.net/Resources/pics/mail_background.png');"><div style="background-color: white; border-top: 2px solid #12ADDB; box-shadow: 0 1px 3px #AAAAAA; line-height: 180%; padding: 0 15px 12px; width: 500px; margin: 50px auto; color: #555555; font-family: Century Gothic,Trebuchet MS,Hiragino Sans GB,微软雅黑,Microsoft Yahei,Tahoma,Helvetica,Arial,SimSun,sans-serif; font-size: 12px;">
## <span style="color: #12addb; font-weight: bold;">> </span>您在[ (ゝω·)~☆ kira ](https://prinzeugen.net)博客上的留言有回复啦！

<div style="padding: 0 12px 0 12px; margin-top: 18px;">prin ，您曾在文章《关于》上发表评论:

TEST FOR MAIL

prin 给您的回复如下:

FXCK U MAN

您可以点击 [查看回复的完整內容 ](https://prinzeugen.net/about/#comment-88)。欢迎再次光临 [(ゝω·)~☆ kira ](https://prinzeugen.net)。

此邮件由系统自动发出，就算你回复了窝也不会回复你哟 ﾟ∀ﾟ)σ

</div></div></td></tr></tbody></table>想要更改邮件样式请自行更改 **$message** 内的内容，窝也贴一段别的样式

$message = '<div style="border-right:#666666 1px solid;border-radius:8px;color:#111;font-size:12px;width:702px;border-bottom:#666666 1px solid;font-family:微软雅黑,arial;margin:10px auto 0px;border-top:#666666 1px solid;border-left:#666666 1px solid"><div class="adM"> </div><div style="width:100%;background:#666666;min-height:60px;color:white;border-radius:6px 6px 0 0"><span style="line-height:60px;min-height:60px;margin-left:30px;font-size:12px">您在 <a style="color:#00bbff;font-weight:600;text-decoration:none" href="' . get_option('home') . '" target="_blank">' . get_option('blogname') . '</a> 上的留言有回复啦！</span> </div> <div style="margin:0px auto;width:90%"> <p>' . trim(get_comment($parent_id)->comment_author) . ', 您好!</p> <p>您于' . trim(get_comment($parent_id)->comment_date) . ' 在文章《' . get_the_title($comment->comment_post_ID) . '》上发表评论: </p> <p style="border-bottom:#ddd 1px solid;border-left:#ddd 1px solid;padding-bottom:20px;background-color:#eee;margin:15px 0px;padding-left:20px;padding-right:20px;border-top:#ddd 1px solid;border-right:#ddd 1px solid;padding-top:20px">' . nl2br(get_comment($parent_id)->comment_content) . '</p> <p>' . trim($comment->comment_author) . ' 于' . trim($comment->comment_date) . ' 给您的回复如下: </p> <p style="border-bottom:#ddd 1px solid;border-left:#ddd 1px solid;padding-bottom:20px;background-color:#eee;margin:15px 0px;padding-left:20px;padding-right:20px;border-top:#ddd 1px solid;border-right:#ddd 1px solid;padding-top:20px">' . nl2br($comment->comment_content) . '</p> <p>您可以点击 <a style="color:#00bbff;text-decoration:none" href="' . htmlspecialchars(get_comment_link($parent_id)) . '" target="_blank">查看回复的完整內容</a></p> <p>感谢你对 <a style="color:#00bbff;text-decoration:none" href="' . get_option('home') . '" target="_blank">' . get_option('blogname') . '</a> 的关注，欢迎再次光临~(｀･ω･)</p><p>（此邮件由系统自动发出，就算你回复了窝也不会回复你哟 ﾟ∀ﾟ)σ）</p></div></div>';

这是预览：

<div style="border-radius: 8px; color: #111; font-size: 12px; width: 702px; font-family: 微软雅黑,arial; margin: 10px auto 0px; border: #666666 1px solid;"><div style="width: 100%; background: #666666; min-height: 60px; color: white; border-radius: 6px 6px 0 0;"><span style="line-height: 60px; min-height: 60px; margin-left: 30px; font-size: 12px;">您在 [(ゝω·)~☆ kira](https://prinzeugen.net) 上的留言有回复啦！</span></div><div style="margin: 0px auto; width: 90%;">H, 您好!

您于2015-07-26 14:29:42 在文章《关于》上发表评论:

AAA I WANT A MAIL

prin 于2015-07-26 15:10:35 给您的回复如下:

蛤

您可以点击 [查看回复的完整內容](https://prinzeugen.net/about/#comment-81)

感谢你对 [(ゝω·)~☆ kira](https://prinzeugen.net) 的关注，欢迎再次光临~(｀･ω･)

此邮件由系统自动发出，就算你回复了窝也不会回复你哟 ﾟ∀ﾟ)σ

</div></div>

//关于坑1

应该是窝主题里的函数哪里出了问题害的窝 SMTP 不行 mail() 也不行折腾了一下午（扶额

如果你明明 SMTP 可以发件但是收不到回复邮件的话，可以在这个函数顶上写个 wp_mail() （参数自己看）来调试

上面的是在别处扒来的，不过这样的话那个评论复选框就没用了呢 [![20150717112829](https://img.prin.studio/images/2015/07/2015-07-17_03-28-41.jpg)](https://img.prin.studio/images/2015/07/2015-07-17_03-28-41.jpg) 等有时间窝在把判断逻辑也写进去



