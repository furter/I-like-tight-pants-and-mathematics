<mt:Ignore>
/*  The following functions and variables are here to support legacy MT templates.
    If you have refreshed your JavaScript template but still use older MT comment
    templates, you may need to uncomment this block in order for those templates 
    to work properly. To use, simply remove the 'mt:Ignore' tags wrapping this
    block of code.
*/
    function hideDocumentElement(id) { return mtHide(id) }
    function showDocumentElement(id) { return mtShow(id) }
    function individualArchivesOnLoad() { return mtEntryOnLoad() }
    function writeCommenterGreeting() { return mtShowGreeting() }
    function rememberMe(f) { return mtRememberMe(f) }
    function forgetMe(f) { return mtForgetMe(f) }
    var commenter_name;
    var commenter_id;
    var commenter_url;
    var commenter_blog_ids;
    var mtcmtmail;
    var mtcmtauth;
    var mtcmthome;
    var captcha_timer;
</mt:Ignore>

// The cookie name to use for storing the blog-side comment session cookie.
var mtCookieName = "<$mt:UserSessionCookieName$>";
var mtCookieDomain = "<$mt:UserSessionCookieDomain$>";
var mtCookiePath = "<$mt:UserSessionCookiePath$>";
var mtCookieTimeout = <$mt:UserSessionCookieTimeout$>;

<mt:Ignore>
/***
 * Simple routine for showing a DOM element (applying a CSS display
 * attribute of 'none').
 */
</mt:Ignore>
function mtHide(id) {
    var el = (typeof id == "string") ? document.getElementById(id) : id;
    if (el) el.style.display = 'none';
}

<mt:Ignore>
/***
 * Simple routine for showing a DOM element (applying a CSS display
 * attribute of 'block').
 */
</mt:Ignore>
function mtShow(id) {
    var el = (typeof id == "string") ? document.getElementById(id) : id;
    if (el) el.style.display = 'block';
}

<mt:Ignore>
/***
 * A utility function for assigning/adding handlers to window events.
 */
</mt:Ignore>
function mtAttachEvent(eventName,func) {
    var onEventName = 'on' + eventName;
    var old = window[onEventName];
    if( typeof old != 'function' )
        window[onEventName] = func;
    else {
        window[onEventName] = function( evt ) {
            old( evt );
            return func( evt );
        };
    }
}

<mt:Ignore>
/***
 * Calls the event named, if there are handlers for it.
 */
</mt:Ignore>
function mtFireEvent(eventName,param) {
    var fn = window['on' + eventName];
    if (typeof fn == 'function') return fn(param);
    return;
}

<mt:Ignore>
/***
 * Displays a relative date.
 * 'ts' is a Date object, 'fds' is a string of the date which
 * will be displayed if the given date is older than 1 week.
 */
</mt:Ignore>
function mtRelativeDate(ts, fds) {
    var now = new Date();
    var ref = ts;
    var delta = Math.floor((now.getTime() - ref.getTime()) / 1000);

    var str;
    if (delta < 60) {
        str = 'moments ago';
    } else if (delta <= 86400) {
        // less than 1 day
        var hours = Math.floor(delta / 3600);
        var min = Math.floor((delta % 3600) / 60);
        if (hours == 1)
            str = '1 hour ago';
        else if (hours > 1)
            str = '2 hours ago'.replace(/2/, hours);
        else if (min == 1)
            str = '1 minute ago';
        else
            str = '2 minutes ago'.replace(/2/, min);
    } else if (delta <= 604800) {
        // less than 1 week
        var days = Math.floor(delta / 86400);
        var hours = Math.floor((delta % 86400) / 3600);
        if (days == 1)
            str = '1 day ago';
        else if (days > 1)
            str = '2 days ago'.replace(/2/, days);
        else if (hours == 1)
            str = '1 hour ago';
        else
            str = '2 hours ago'.replace(/2/, hours);
    }
    return str ? str : fds;
}

<mt:Ignore>
/***
 * Used to display an edit link for the given entry.
 */
</mt:Ignore>
function mtEditLink(entry_id, author_id) {
    var u = mtGetUser();
    if (! u) return;
    if (! entry_id) return;
    if (! author_id) return;
    if (u.id != author_id) return;
    var link = '<a href="<$mt:AdminScript$>?__mode=view&amp;_type=entry&amp;id=' + entry_id + '">Edit</a>';
    document.write(link);
}

<mt:Ignore>
/***
 * Called when an input field on the comment form receives focus.
 */
</mt:Ignore>
function mtCommentFormOnFocus() {
    // if CAPTCHA is enabled, this causes the captcha image to be
    // displayed if it hasn't been already.
    mtShowCaptcha();
}

<mt:Ignore>
/***
 * Displays a captcha field for anonymous commenters.
 */
</mt:Ignore>
var mtCaptchaVisible = false;
function mtShowCaptcha() {
    var u = mtGetUser();
    if ( u && u.is_authenticated ) return;
    if (mtCaptchaVisible) return;
    var div = document.getElementById('comments-open-captcha');
    if (div) {
        div.innerHTML = '<$mt:CaptchaFields$>';
        mtCaptchaVisible = true;
    }
}

<mt:Ignore>
/* user object
    -- saved in user cookie --
    u.name (display name)
    u.url (link to home page)
    u.email (for anonymous only)
    u.userpic (url for commenter/author)
    u.profile (link to profile)
    u.is_trusted (boolean)
    u.is_author (user has posting rights)
    u.is_banned (banned status; neither post/comment perms)
    u.can_post (has permission to post)
    u.can_comment (has permission to comment)

    -- status fields --
    u.is_authenticated (boolean)
    u.is_anonymous (user is anonymous)
*/
</mt:Ignore>

var is_preview;
var user;
<mt:Ignore>
/***
 * Assigns a user object as the actively logged in user; also saves the
 * user information in a browser cookie.
 */
</mt:Ignore>
function mtSetUser(u) {
    if (u) {
        // persist this
        user = u;
        mtSaveUser();
        // sync up user greeting
        mtFireEvent('usersignin');
    }
}

<mt:Ignore>
/***
 * Simple function that escapes single quote characters for storing
 * in a cookie.
 */
</mt:Ignore>
function mtEscapeJS(s) {
    s = s.replace(/'/g, "&apos;");
    return s;
}

<mt:Ignore>
/***
 * Simple function that unescapes single quote characters that were
 * stored in a cookie.
 */
</mt:Ignore>
function mtUnescapeJS(s) {
    s = s.replace(/&apos;/g, "'");
    return s;
}

<mt:Ignore>
/***
 * Serializes a user object into a string, suitable for storing as a cookie.
 */
</mt:Ignore>
function mtBakeUserCookie(u) {
    var str = "";
    if (u.name) str += "name:'" + mtEscapeJS(u.name) + "';";
    if (u.url) str += "url:'" + mtEscapeJS(u.url) + "';";
    if (u.email) str += "email:'" + mtEscapeJS(u.email) + "';";
    if (u.is_authenticated) str += "is_authenticated:'1';";
    if (u.profile) str += "profile:'" + mtEscapeJS(u.profile) + "';";
    if (u.userpic) str += "userpic:'" + mtEscapeJS(u.userpic) + "';";
    if (u.sid) str += "sid:'" + mtEscapeJS(u.sid) + "';";
    str += "is_trusted:'" + (u.is_trusted ? "1" : "0") + "';";
    str += "is_author:'" + (u.is_author ? "1" : "0") + "';";
    str += "is_banned:'" + (u.is_banned ? "1" : "0") + "';";
    str += "can_post:'" + (u.can_post ? "1" : "0") + "';";
    str += "can_comment:'" + (u.can_comment ? "1" : "0") + "';";
    str = str.replace(/;$/, '');
    return str;
}

<mt:Ignore>
/***
 * Unserializes a user cookie and returns a user object with the restored
 * state.
 */
</mt:Ignore>
function mtUnbakeUserCookie(s) {
    if (!s) return;

    var u = {};
    var m;
    while (m = s.match(/^((name|url|email|is_authenticated|profile|userpic|sid|is_trusted|is_author|is_banned|can_post|can_comment):'([^']+?)';?)/)) {
        s = s.substring(m[1].length);
        if (m[2].match(/^(is|can)_/)) // boolean fields
            u[m[2]] = m[3] == '1' ? true : false;
        else
            u[m[2]] = mtUnescapeJS(m[3]);
    }
    if (u.is_authenticated) {
        u.is_anonymous = false;
    } else {
        u.is_anonymous = true;
        u.can_post = false;
        u.is_author = false;
        u.is_banned = false;
        u.is_trusted = false;
    }
    return u;
}

<mt:Ignore>
/***
 * Retrieves an object of the currently logged in user's state.
 * If no user is logged in or cookied, this will return null.
 */
</mt:Ignore>
function mtGetUser() {
    if (!user) {
        var cookie = mtGetCookie(mtCookieName);
        if (!cookie) return;
        user = mtUnbakeUserCookie(cookie);
        if (! user) {
            user = {};
            user.is_anonymous = true;
            user.can_post = false;
            user.is_author = false;
            user.is_banned = false;
            user.is_trusted = false;
        }
    }
    return user;
}

<mt:Ignore>
/***
 * Issues a request to the MT comment script to retrieve the currently
 * logged-in user (if any).
 */
</mt:Ignore>
var mtFetchedUser = false;
<mt:IfBlog>
function mtFetchUser(cb) {
    if (!cb) cb = 'mtSetUser';
    if ( ( cb == 'mtSetUser' ) && mtGetUser() ) {
        var url = document.URL;
        url = url.replace(/#.+$/, '');
        url += '#comments-open';
        location.href = url;
    } else {
        // we aren't using AJAX for this, since we may have to request
        // from a different domain. JSONP to the rescue.
        mtFetchedUser = true;
        var script = document.createElement('script');
        var ts = new Date().getTime();
        script.src = '<$mt:CGIPath$><$mt:CommentScript$>?__mode=session_js&blog_id=<$mt:BlogID$>&jsonp=' + cb + '&ts=' + ts;
        (document.getElementsByTagName('head'))[0].appendChild(script);
    }
}
</mt:IfBlog>

<mt:Ignore>
/***
 * Called when the 'Remember me' checkbox is changed. If the checkbox
 * is cleared, the cached user cookie is immediately cleared.
 */
</mt:Ignore>
function mtRememberMeOnClick(b) {
    if (!b.checked)
        mtClearUser(b.form);
    return true;
}

<mt:Ignore>
/***
 * Called when comment form is sent.
 * Required parameter: Form DOM object of comment form.
 * If form has a 'bakecookie' member, it will be used to signal
 * storing the anonymous commenter information to a cookie.
 * If form has a 'armor' member, it will be used to store
 * a token that is checked by the comment script.
 */
</mt:Ignore>
<mt:IfBlog>
var mtRequestSubmitted = false;
function mtCommentOnSubmit(f) {
    if (!mtRequestSubmitted) {
        mtRequestSubmitted = true;

        if (f.armor)
            f.armor.value = '<$mt:BlogSitePath encode_sha1="1"$>';
        if (f.bakecookie && f.bakecookie.checked)
            mtSaveUser(f);

        // disable submit buttons
        if (f.preview_button) f.preview_button.disabled = true;
        if (f.post) f.post.disabled = true;

        var u = mtGetUser();
        if ( !is_preview && ( u && u.is_authenticated ) ) {
            // validate session; then submit
            mtFetchedUser = false;
            mtFetchUser('mtCommentSessionVerify');
            return false;
        }

        return true;
    }
    return false;
}

function mtCommentSessionVerify(app_user) {
    var u = mtGetUser();
    var f = document['comments_form'];
    if ( u && app_user && app_user.sid && ( u.sid == app_user.sid ) ) {
        f.submit();
    } else {
        alert('Your session has expired. Please sign in again to comment.');
        mtClearUser();
        mtFireEvent('usersignin');
<mt:IfRegistrationRequired>
        mtShow('comments-form');
        mtHide('comments-open-footer');
</mt:IfRegistrationRequired>
    }
}

function mtUserOnLoad() {
    var u = mtGetUser();

    // if the user is authenticated, hide the 'anonymous' fields
    // and any captcha input if already shown
    if ( document.getElementById('comments-form')) {
        if ( u && u.is_authenticated ) {
            mtShow('comments-form');
            mtHide('comments-open-data');
            if (mtCaptchaVisible)
                mtHide('comments-open-captcha');
        } else {
<mt:IfRegistrationRequired>
            mtHide('comments-form');
</mt:IfRegistrationRequired>
        }
        if ( u && u.is_banned )
            mtHide('comments-form');

        // if we're previewing a comment, make sure the captcha
        // field is visible
        if (is_preview)
            mtShowCaptcha();
        else
            mtShowGreeting();

        // populate anonymous comment fields if user is cookied as anonymous
        var cf = document['comments_form'];
        if (cf) {
            if (u && u.is_anonymous) {
                if (u.email) cf.email.value = u.email;
                if (u.name) cf.author.value = u.name;
                if (u.url) cf.url.value = u.url;
                if (cf.bakecookie)
                    cf.bakecookie.checked = u.name || u.email;
            } else {
                if (u && u.sid && cf.sid)
                    cf.sid.value = u.sid;
            }
            if (cf.post && cf.post.disabled)
                cf.post.disabled = false;
            if (cf.preview_button && cf.preview_button.disabled)
                cf.preview_button.disabled = false;
            mtRequestSubmitted = false;
        }
    }
}
</mt:IfBlog>

<mt:Ignore>
/***
 * Called when an entry archive page is loaded.
 * This routine controls which elements of the comment form are shown
 * or hidden, depending on commenter type and blog configuration.
 */
</mt:Ignore>
<mt:IfBlog>
function mtEntryOnLoad() {
    var cf = document['comments_form'];
    if (cf && cf.preview) cf.preview.value = '';
    <mt:Unless tag="IfPingsAccepted">mtHide('trackbacks-info');</mt:Unless>
    <mt:Unless tag="IfCommentsAccepted">mtHide('comments-open');</mt:Unless>
    mtFireEvent('usersignin');
}

function mtEntryOnUnload() {
    if (mtRequestSubmitted) {
        var cf = document['comments_form'];
        if (cf) {
            if (cf.post && cf.post.disabled)
                cf.post.disabled = false;
            if (cf.preview_button && cf.preview_button.disabled)
                cf.preview_button.disabled = false;
        }
        mtRequestSubmitted = false;
    }
    return true;
}

mtAttachEvent('usersignin', mtUserOnLoad);
</mt:IfBlog>

<mt:Ignore>
/***
 * Handles the action of the "Sign in" link. First clears any existing
 * user cookie, then directs to the MT comment script to sign the user in.
 */
</mt:Ignore>
function mtSignIn() {
    var doc_url = document.URL;
    doc_url = doc_url.replace(/#.+/, '');
    var url = '<$mt:SignInLink$>';
    if (is_preview) {
        if ( document['comments_form'] ) {
            var entry_id = document['comments_form'].entry_id.value;
            url += '&entry_id=' + entry_id;
        } else {
            url += '&return_url=<$mt:BlogURL encode_url="1"$>';
        }
    } else {
        url += '&return_url=' + encodeURIComponent(doc_url);
    }
    mtClearUser();
    location.href = url;
}

function mtSignInOnClick(sign_in_element) {
    var el;
    if (sign_in_element) {
        // display throbber
        el = document.getElementById(sign_in_element);
        if (!el)  // legacy MT 4.x element id
            el = document.getElementById('comment-form-external-auth');
    }
    if (el)
        el.innerHTML = 'Signing in... <span class="status-indicator">&nbsp;</span>';

    mtClearUser(); // clear any 'anonymous' user cookie to allow sign in
    mtFetchUser('mtSetUserOrLogin');
    return false;
}

function mtSetUserOrLogin(u) {
    if (u && u.is_authenticated) {
        mtSetUser(u);
    } else {
        // user really isn't logged in; so let's do this!
        mtSignIn();
    }
}

<mt:Ignore>
/***
 * Handles sign out from the web site.
 * First clears any existing user cookie, then direts to the MT comment
 * script to sign the user out.
 */
</mt:Ignore>
function mtSignOut(entry_id) {
    mtClearUser();
    var doc_url = document.URL;
    doc_url = doc_url.replace(/#.+/, '');
    var url = '<$mt:SignOutLink$>';
    if (is_preview) {
        if ( document['comments_form'] ) {
            var entry_id = document['comments_form'].entry_id.value;
            url += '&entry_id=' + entry_id;
        } else {
            url += '&return_url=<$mt:BlogURL encode_url="1"$>';
        }
    } else {
        url += '&return_url=' + encodeURIComponent(doc_url);
    }
    location.href = url;
}

<mt:Ignore>
/***
 * Handles the action of the "Sign out" link.
 */
</mt:Ignore>
function mtSignOutOnClick() {
    mtSignOut();
    return false;
}

<mt:Ignore>
/***
 * Handles the display of the greeting message, depending on what kind of
 * user is logged in and blog comment policy.
 */
</mt:Ignore>
<mt:IfBlog>
function mtShowGreeting() {
<mt:IfRegistrationAllowed>
    var reg_reqd = <mt:IfRegistrationRequired>true<mt:Else>false</mt:IfRegistrationRequired>;

    var cf = document['comments_form'];
    if (!cf) return;

    var el = document.getElementById('comment-greeting');
    if (!el)  // legacy MT 4.x element id
        el = document.getElementById('comment-form-external-auth');
    if (!el) return;

    var eid = cf.entry_id;
    var entry_id;
    if (eid) entry_id = eid.value;

    var phrase;
    var u = mtGetUser();

    if ( u && u.is_authenticated ) {
        if ( u.is_banned ) {
            phrase = 'You do not have permission to comment on this blog. (\<a href=\"javas\cript:void(0);\" onclick=\"return mtSignOutOnClick();\"\>sign out\<\/a\>)';
        } else {
            var user_link;
            if ( u.is_author ) {
                user_link = '<a href="<$mt:CGIPath$><$mt:CommentScript$>?__mode=edit_profile&return_url=' + encodeURIComponent( location.href );
                user_link += '">' + u.name + '</a>';
            } else {
                // registered user, but not a user with posting rights
                if (u.url)
                    user_link = '<a href="' + u.url + '">' + u.name + '</a>';
                else
                    user_link = u.name;
            }
            // TBD: supplement phrase with userpic if one is available.
            phrase = 'Thanks for signing in, __NAME__. (\<a href=\"javas\cript:void(0)\" onclick=\"return mtSignOutOnClick();\"\>sign out\<\/a\>)';
            phrase = phrase.replace(/__NAME__/, user_link);
        }
    } else {
        if (reg_reqd) {
            phrase = '\<a href=\"javas\cript:void(0)\" onclick=\"return mtSignInOnClick(\'comment-greeting\')\"\>Sign in\<\/a\> to comment.';
        } else {
            phrase = '\<a href=\"javas\cript:void(0)\" onclick=\"return mtSignInOnClick(\'comment-greeting\')\"\>Sign in\<\/a\> to comment, or comment anonymously.';
        }
    }
    el.innerHTML = phrase;
<mt:Else>
    mtShowCaptcha();
</mt:IfRegistrationAllowed>
}
</mt:IfBlog>

<mt:Ignore>
/***
 * Handles the action of the 'Reply' links.
 */
</mt:Ignore>
function mtReplyCommentOnClick(parent_id, author) {
    mtShow('comment-form-reply');

    var checkbox = document.getElementById('comment-reply');
    var label = document.getElementById('comment-reply-label');
    var text = document.getElementById('comment-text');

    // Populate label with new values
    var reply_text = 'Replying to \<a href=\"#comment-__PARENT__\" onclick=\"location.href=this.href; return false\"\>comment from __AUTHOR__\<\/a\>';
    reply_text = reply_text.replace(/__PARENT__/, parent_id);
    reply_text = reply_text.replace(/__AUTHOR__/, author);
    label.innerHTML = reply_text;

    checkbox.value = parent_id; 
    checkbox.checked = true;
    try {
        // text field may be hidden
        text.focus();
    } catch(e) {
    }

    mtSetCommentParentID();
}

<mt:Ignore>
/***
 * Sets the parent comment ID when replying to a comment.
 */
</mt:Ignore>
function mtSetCommentParentID() {
    var checkbox = document.getElementById('comment-reply');
    var parent_id_field = document.getElementById('comment-parent-id');
    if (!checkbox || !parent_id_field) return;

    var pid = 0;
    if (checkbox.checked == true)
        pid = checkbox.value;
    parent_id_field.value = pid;
}

<mt:Ignore>
/***
 * Persists a copy of the current user cookie into the browser cookie stash.
 */
</mt:Ignore>
function mtSaveUser(f) {
    // We can't reliably store the user cookie during a preview.
    if (is_preview) return;

    var u = mtGetUser();

    if (f && (!u || u.is_anonymous)) {
        if ( !u ) {
            u = {};
            u.is_authenticated = false;
            u.can_comment = true;
            u.is_author = false;
            u.is_banned = false;
            u.is_anonymous = true;
            u.is_trusted = false;
        }
        if (f.author != undefined) u.name = f.author.value;
        if (f.email != undefined) u.email = f.email.value;
        if (f.url != undefined) u.url = f.url.value;
    }

    if (!u) return;

    var cache_period = mtCookieTimeout * 1000;

    // cache anonymous user info for a long period if the
    // user has requested to be remembered
    if (u.is_anonymous && f && f.bakecookie && f.bakecookie.checked)
        cache_period = 365 * 24 * 60 * 60 * 1000;

    var now = new Date();
    mtFixDate(now);
    now.setTime(now.getTime() + cache_period);

    var cmtcookie = mtBakeUserCookie(u);
    mtSetCookie(mtCookieName, cmtcookie, now, mtCookiePath, mtCookieDomain,
        location.protocol == 'https:');
}

<mt:Ignore>
/***
 * Clears the blog-side user cookie.
 */
</mt:Ignore>
function mtClearUser() {
    user = null;
    mtDeleteCookie(mtCookieName, mtCookiePath, mtCookieDomain,
        location.protocol == 'https:');
}

<mt:Ignore>
/***
 * Sets a browser cookie.
 */
</mt:Ignore>
function mtSetCookie(name, value, expires, path, domain, secure) {
    if (domain && domain.match(/^\.?localhost$/))
        domain = null;
    var curCookie = name + "=" + escape(value) +
        (expires ? "; expires=" + expires.toGMTString() : "") +
        (path ? "; path=" + path : "") +
        (domain ? "; domain=" + domain : "") +
        (secure ? "; secure" : "");
    document.cookie = curCookie;
}

<mt:Ignore>
/***
 * Retrieves a browser cookie.
 */
</mt:Ignore>
function mtGetCookie(name) {
    var prefix = name + '=';
    var c = document.cookie;
    var cookieStartIndex = c.indexOf(prefix);
    if (cookieStartIndex == -1)
        return '';
    var cookieEndIndex = c.indexOf(";", cookieStartIndex + prefix.length);
    if (cookieEndIndex == -1)
        cookieEndIndex = c.length;
    return unescape(c.substring(cookieStartIndex + prefix.length, cookieEndIndex));
}

<mt:Ignore>
/***
 * Deletes a browser cookie.
 */
</mt:Ignore>
function mtDeleteCookie(name, path, domain, secure) {
    if (mtGetCookie(name)) {
        if (domain && domain.match(/^\.?localhost$/))
            domain = null;
        document.cookie = name + "=" +
            (path ? "; path=" + path : "") +
            (domain ? "; domain=" + domain : "") +
            (secure ? "; secure" : "") +
            "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

function mtFixDate(date) {
    var skew = (new Date(0)).getTime();
    if (skew > 0)
        date.setTime(date.getTime() - skew);
}

<mt:Ignore>
/***
 * Returns a XMLHttpRequest object (for Ajax operations).
 */
</mt:Ignore>
function mtGetXmlHttp() {
    if ( !window.XMLHttpRequest ) {
        window.XMLHttpRequest = function() {
            var types = [
                "Microsoft.XMLHTTP",
                "MSXML2.XMLHTTP.5.0",
                "MSXML2.XMLHTTP.4.0",
                "MSXML2.XMLHTTP.3.0",
                "MSXML2.XMLHTTP"
            ];

            for ( var i = 0; i < types.length; i++ ) {
                try {
                    return new ActiveXObject( types[ i ] );
                } catch( e ) {}
            }

            return undefined;
        };
    }
    if ( window.XMLHttpRequest )
        return new XMLHttpRequest();
}

// BEGIN: fast browser onload init
// Modifications by David Davis, DWD
// Dean Edwards/Matthias Miller/John Resig
// http://dean.edwards.name/weblog/2006/06/again/?full#comment5338

function mtInit() {
    // quit if this function has already been called
    if (arguments.callee.done) return;

    // flag this function so we don't do the same thing twice
    arguments.callee.done = true;

    // kill the timer
    // DWD - check against window
    if ( window._timer ) clearInterval(window._timer);

    // DWD - fire the window onload now, and replace it
    if ( window.onload && ( window.onload !== window.mtInit ) ) {
        window.onload();
        window.onload = function() {};
    }
}

/* for Mozilla/Opera9 */
if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", mtInit, false);
}

/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
var script = document.getElementById("__ie_onload");
script.onreadystatechange = function() {
    if (this.readyState == "complete") {
        mtInit(); // call the onload handler
    }
};
/*@end @*/

/* for Safari */
if (/WebKit/i.test(navigator.userAgent)) { // sniff
    _timer = setInterval(function() {
        if (/loaded|complete/.test(document.readyState)) {
            mtInit(); // call the onload handler
        }
    }, 10);
}

/* for other browsers */
window.onload = mtInit;

// END: fast browser onload init

<mt:IfBlog>
<mt:IfRegistrationAllowed>
/***
 * If request contains a '#_login' or '#_logout' hash, use this to
 * also delete the blog-side user cookie, since we're coming back from
 * a login, logout or edit profile operation.
 */
var clearCookie = ( window.location.hash && window.location.hash.match( /^#_log(in|out)/ ) ) ? true : false;
if (clearCookie) {
    // clear any logged in state
    mtClearUser();
    if (RegExp.$1 == 'in')
        mtFetchUser();
} else {
    <mt:Ignore>
    /***
     * Uncondition this call to fetch the current user state (if available)
     * from MT upon page load if no user cookie is already present.
     * This is okay if you have a private install, such as an Intranet;
     * not recommended for public web sites!
     */
    </mt:Ignore>
    if ( is_preview && !user )
        mtFetchUser();
}
</mt:IfRegistrationAllowed>
</mt:IfBlog>
