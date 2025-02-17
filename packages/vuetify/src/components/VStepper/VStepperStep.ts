// Components
import VIcon from '../VIcon'

// Mixins
import Colorable from '../../mixins/colorable'
import { inject as RegistrableInject } from '../../mixins/registrable'

// Directives
import ripple from '../../directives/ripple'

// Utilities
import mixins from '../../util/mixins'

// Types
import { VNode } from 'vue'
import { PropValidator } from 'vue/types/options'

type VuetifyStepperRuleValidator = () => string | boolean

const baseMixins = mixins(
  Colorable,
  RegistrableInject('stepper', 'v-stepper-step', 'v-stepper')
)

interface options extends InstanceType<typeof baseMixins> {
  stepClick: (step: number | string) => void
}
/* @vue/component */
export default baseMixins.extend<options>().extend({
  name: 'v-stepper-step',

  directives: { ripple },

  inject: ['stepClick'],

  props: {
    color: {
      type: String,
      default: 'primary',
    },
    complete: Boolean,
    completeIcon: {
      type: String,
      default: '$vuetify.icons.complete',
    },
    editIcon: {
      type: String,
      default: '$vuetify.icons.edit',
    },
    errorIcon: {
      type: String,
      default: '$vuetify.icons.error',
    },
    editable: Boolean,
    rules: {
      type: Array,
      default: () => [],
    } as PropValidator<VuetifyStepperRuleValidator[]>,
    step: [Number, String],
  },

  data () {
    return {
      isActive: false,
      isInactive: true,
    }
  },

  computed: {
    classes (): object {
      return {
        'v-stepper__step--active': this.isActive,
        'v-stepper__step--editable': this.editable,
        'v-stepper__step--inactive': this.isInactive,
        'v-stepper__step--error error--text': this.hasError,
        'v-stepper__step--complete': this.complete,
      }
    },
    hasError (): boolean {
      return this.rules.some(validate => validate() !== true)
    },
  },

  mounted () {
    this.stepper && this.stepper.register(this)
  },

  beforeDestroy () {
    this.stepper && this.stepper.unregister(this)
  },

  methods: {
    click (e: MouseEvent) {
      e.stopPropagation()

      this.$emit('click', e)

      if (this.editable) {
        this.stepClick(this.step)
      }
    },
    genIcon (icon: string) {
      return this.$createElement(VIcon, icon)
    },
    genLabel () {
      return this.$createElement('div', {
        staticClass: 'v-stepper__label',
      }, this.$slots.default)
    },
    genStep () {
      const color = (!this.hasError && (this.complete || this.isActive)) ? this.color : false

      return this.$createElement('span', this.setBackgroundColor(color, {
        staticClass: 'v-stepper__step__step',
      }), this.genStepContent())
    },
    genStepContent () {
      const children = []

      if (this.hasError) {
        children.push(this.genIcon(this.errorIcon))
      } else if (this.complete) {
        if (this.editable) {
          children.push(this.genIcon(this.editIcon))
        } else {
          children.push(this.genIcon(this.completeIcon))
        }
      } else {
        children.push(String(this.step))
      }

      return children
    },
    toggle (step: number | string) {
      this.isActive = step.toString() === this.step.toString()
      this.isInactive = Number(step) < Number(this.step)
    },
  },

  render (h): VNode {
    return h('div', {
      staticClass: 'v-stepper__step',
      class: this.classes,
      directives: [{
        name: 'ripple',
        value: this.editable,
      }],
      on: { click: this.click },
    }, [
      this.genStep(),
      this.genLabel(),
    ])
  },
})
