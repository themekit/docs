/*
 * STYLES
 */

// BOOTSTRAP
import 'bootstrap-sass/assets/stylesheets/_bootstrap'

// ICONS
import 'font-awesome/css/font-awesome'

// THEMEKIT
import 'themekit-vue/dist/themekit.css'
import 'themekit-vue/src/sass/_themekit'

// HIGHLIGHT.JS
import 'highlight.js/styles/github-gist.css'

// DOCS
import '../sass/_docs'

/*
 * SCRIPTS
 */
 
import 'jquery'
import 'bootstrap-sass/assets/javascripts/bootstrap'
import 'modernizr/modernizr'

// EXTERNALS
import appStore from 'themekit-docs/src/js/app.store'

// MARKED
import marked from 'marked'
marked.setOptions(appStore.config.marked)

// Vue library
import Vue from 'vue'

// Marked filter
Vue.filter('marked', marked)

// Excerpt filter
import crop from 'mout/string/crop'
Vue.filter('excerpt', (value, length) => {
	return crop(value, length || 100)
})

// ThemeKit
import ThemeKit from 'themekit-vue'
Vue.use(ThemeKit)