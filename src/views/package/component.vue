<template>
	<tabs nav-id="tabs-navbar" :class="tabs">
		<tab-pane id="demo" label="Demo" v-show="hasDemos" :active="hasDemos" :visible="hasDemos">
			<iframe v-if="hasDemos" :src="demos[0].url" frameborder="0"></iframe>
		</tab-pane>
		<tab-pane :active="!hasDemos" icon="fa fa-fw fa-file-text-o" label="Docs">
			<div class="container-fluid docs-container">
				
				<template v-if="component">
					<h1 class="component-name">{{ component.label }}</h1>
					<template v-if="component.description">
						{{{ component.description.data | marked }}}
					</template>

					<template v-if="component.requirements.length">
						<h3>Requirements</h3>
						<blockquote class="warning">
							The {{ component.label }} component <strong>must be used</strong> as a child element of
							<template v-for="required in component.requirements">
								<a v-link="appHelpers.routeToComponent(packageId, required.name)" v-text="required.label"></a><span v-text="$index | separatorLast component.requirements.length"></span>
							</template>
						</blockquote>
					</template>

					<template v-if="!component.template && !component.mixins.length">
						<h3>Warning</h3>
						<blockquote class="warning">
							The {{ component.label }} component does not have a template.
							<template v-if="extendedBy.length">
								It's likely that this component is not meant to be used directly. Instead, you probably want to use one of the components extending {{ component.label }}, below.
							</template>
						</blockquote>
					</template>

					<h3 v-if="extendedBy.length || usedBy.length">Hierarchy</h3>
					<template v-if="extendedBy.length">
						<blockquote>
							The {{ component.label }} component is extended by:
							<ul class="list-unstyled">
								<li v-for="extending in extendedBy">
									<a v-link="appHelpers.routeToComponent(packageId, extending.name)" v-text="extending.label"></a>
								</li>
							</ul>
						</blockquote>
					</template>

					<template v-if="usedBy.length">
						<blockquote>
							The {{ component.label }} component is used by:
							<ul class="list-unstyled">
								<li v-for="using in usedBy">
									<a v-link="appHelpers.routeToComponent(packageId, using.name)" v-text="using.label"></a>
								</li>
							</ul>
						</blockquote>
					</template>

					<template v-if="component.components.length">
						<h3>Components</h3>
						<blockquote>
							The {{ component.label }} component is using:
							<ul class="list-unstyled">
								<li v-for="used in component.components">
									<a v-link="appHelpers.routeToComponent(packageId, used.id)" v-text="used.label"></a>
								</li>
							</ul>
						</blockquote>
					</template>

					<template v-if="component.mixins">
						<h3>Mixins</h3>
						<blockquote>
							The {{ component.label }} component extends:
							<ul class="list-unstyled">
								<li v-for="mix in component.mixins">
									<a v-link="appHelpers.routeToComponent(packageId, mix.name)" v-text="mix.label"></a>
								</li>
							</ul>
						</blockquote>
					</template>

					<hr>

					<template v-if="component.slots.length">
						<h3>Slots</h3>
						<blockquote>
							<p>A <strong>slot</strong> is a special attribute that instructs the component's parent how to distribute content.</p>
							<small>You can learn more about <a href="http://vuejs.org/guide/components.html#Content_Distribution_with_Slots">Content Distribution with Slots in Vue.js components</a></small>
						</blockquote>
						<p>The {{ component.label }} component can have the following slot attribute values:</p>
						<template v-for="slot in component.slots">
							<div class="panel panel-default panel-body">
								<h4>{{ slot.name }}</h4>
								<p v-if="slot.description">{{{ slot.description | marked }}}</p>
							</div>
						</template>
						<hr>
					</template>

					<template v-if="component.props.length">
						<h3>Properties</h3>
						<blockquote>
							<p>Properties define how the component expects to receive data from its parent.</p>
							<small>You can learn more about <a href="http://vuejs.org/guide/components.html#Passing_Data_with_Props">Passing Data with Props in Vue.js components</a></small>
						</blockquote>
						<p>The {{ component.label }} component exposes the following properties:</p>
						<template v-for="prop in component.props">
							<div class="panel panel-default panel-body">
								<h4>{{ prop.prop.name }}</h4>
								<template v-if="prop.description">{{{ prop.description.data | marked }}}</template>
								<h5 v-if="prop.prop.type">type: <code>{{ prop.prop.type }}</code></h5>
								<h5 v-if="prop.prop.default">default: <code>{{ prop.prop.default }}</code></h5>
								<h5 v-if="prop.prop.required">required: <code>true</code></h5>
							</div>
						</template>
						<hr>
					</template>

					<template v-if="component.events.length">
						<h3>Event listeners</h3>
						<p>The {{ component.label }} component listens and responds to the following events:</p>
						<template v-for="event in component.events">
							<h4>{{ event.name }}</h4>
							<p v-if="event.description">{{{ event.description | unindent | marked }}}</p>
							<pre><code v-highlight="event.event" lang="javascript"></code></pre>
						</template>
					</template>
				</template>

				<template v-if="!component && !serviceLoading && appState.pkg">
					<template v-else>
						<h1>{{ componentId }}</h1>
						<h3>The component was not found.</h3>
					</template>
				</template>

				<div class="alert alert-default" v-if="serviceLoading && !component">Loading data ...</div>
			</div>
		</tab-pane>
	</tabs>
</template>

<script>
	import appStore from 'themekit-docs/src/js/app.store'
	import Store from 'themekit-docs/src/mixins/store'
	import { Tabs, TabPane } from 'themekit-vue'
	import pascalCase from 'mout/string/pascalCase'

	export default {
		mixins: [
			Store
		],
		filters: {
			separatorLast: function ($index, $length, separator, lastSeparator) {
				if ($index === $length - 2) {
					return lastSeparator || ' or '
				}
				if ($index !== $length - 1) {
					return separator || ', '
				}
			}
		},
		data () {
			return {
				component: null,
				tabId: null,
				appState: appStore.state,
				appHelpers: appStore.helpers
			}
		},
		computed: {
			componentName () {
				return this.$route.params.componentName
			},
			packageName () {
				return this.$route.params.packageName
			},
			version () {
				return this.$route.params.version
			},
			components () {
				return this.appState.components
			},
			extendedBy () {
				if (this.components) {
					return this.components.filter((extending) => {
						return extending.mixins && extending.mixins.filter((mix) => {
							return mix.name === this.component.name
						}).length > 0
					})
				}
			},
			usedBy () {
				if (this.components) {
					return this.components.filter((using) => {
						return using.components && 
							Object.keys(using.components).indexOf(pascalCase(this.component.label)) !== -1
					})
				}
			},
			tabs () {
				return {
					'tabs-demo': this.tabId === 'demo'
				}
			},
			demos () {
				if (this.component) {
					return this.component.demos
				}
				return []
			},
			hasDemos () {
				return this.demos.length > 0
			}
		},
		created () {
			this.store.getComponentVersionByName(this.componentName, this.packageName, this.version).then((data) => this.component = data)
		},
		events: {
			'shown.tk.tab': function (tabId) {
				this.tabId = tabId
			}
		},
		watch: {
			component (value) {
				if (value) {
					this.appState.page.title = this.component.label
				}
			}
		},
		components: {
			Tabs,
			TabPane
		}
	}
</script>

<style lang="sass">
	.tabbable.tabs-demo {
		position: relative;
		overflow: hidden;
		height: 100%;
		width: 100%;
		margin: 0;
		.tab-content {
			position: relative;
			height: 100%;
			width: 100%;
			padding: 0;
		}
	}
	#demo {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		padding: 0;
	}
	iframe {
		width: 100%;
		height: 100%;
	}
	.component-name {
		text-transform: capitalize;
	}
</style>