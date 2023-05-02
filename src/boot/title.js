import {boot} from 'quasar/wrappers'
import titleMixin from 'src/mixinx/title-mixin'

export default boot (({app}) => {
  app.mixin(titleMixin);
})
