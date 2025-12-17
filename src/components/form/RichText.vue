<template>
  <div>
    <textarea ref="editorRef" />
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  toolbar: {
    type: Array,
    default: () => [['Bold', 'Italic', 'Underline', '-', 'NumberedList', 'BulletedList', '-', 'Link', 'Unlink', 'Source']],
  },
  height: {
    type: Number,
    default: 300,
  },
  allowIframe: {          
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const editorRef = ref(null)
let editorInstance = null

onMounted(() => {
  const script = document.createElement('script')

  script.src = 'https://cdn.ckeditor.com/4.22.1/standard/ckeditor.js'

  script.onload = () => {
    const config = {
      versionCheck: false,
      height: props.height,
      ...(props.toolbar ? { toolbar: props.toolbar } : {}),
    }

    if (props.allowIframe) {
      config.toolbarGroups = [
        { name: 'document', groups: ['mode', 'document', 'doctools'] },
        { name: 'clipboard', groups: ['clipboard', 'undo'] },
        { name: 'editing', groups: ['find', 'selection', 'spellchecker', 'editing'] },
        { name: 'forms', groups: ['forms'] },
        { name: 'paragraph', groups: ['list', 'indent', 'blocks', 'align', 'bidi', 'paragraph'] },
        '/',
        { name: 'basicstyles', groups: ['basicstyles', 'cleanup'] },
        { name: 'links', groups: ['links'] },
        { name: 'insert', groups: ['insert'] },
        '/',
        { name: 'styles', groups: ['styles'] },
        { name: 'colors', groups: ['colors'] },
        { name: 'tools', groups: ['tools'] },
        { name: 'others', groups: ['others'] },
        { name: 'about', groups: ['about'] },
      ]
      config.scayt_sLang = 'en_GB'
      config.scayt_autoStartup = true
      config.scayt_disableOptionsStorage = 'lang'
      config.allowedContent = true
    }

    editorInstance = CKEDITOR.replace(editorRef.value, config)

    editorInstance.setData(props.modelValue)

    editorInstance.on('change', () => {
      emit('update:modelValue', editorInstance.getData())
    })
  }

  document.body.appendChild(script)
})

onBeforeUnmount(() => {
  if (editorInstance) editorInstance.destroy()
})

watch(
  () => props.modelValue,
  newValue => {
    if (editorInstance && editorInstance.getData() !== newValue) {
      editorInstance.setData(newValue)
    }
  },
)
</script>
