export {}

// Third-party packages without type definitions
declare module 'webfontloader' {
  const WebFont: any
  export default WebFont
}

declare module 'vue-prism-component' {
  const Prism: any
  export default Prism
}

declare module 'prismjs' {
  const Prism: any
  export default Prism
}

declare module 'prismjs/themes/prism-tomorrow.css' {
  const css: any
  export default css
}

declare module '@iconify/types' {
  export interface IconifyJSON { [key: string]: any }
}

// Vue instance augmentation
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $can?: (action?: string, subject?: string) => boolean
  }
}
