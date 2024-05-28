<template>
  <div
    p-4
    flex="~ col"
    gap-4
    h-full
    box-border
  >
    <div
      flex
      items-center
      gap-2
    >
      <div
        text-center
        w-20
      >
        选择设备
      </div>
      <n-input-group>
        <n-select
          v-model:value="selectedPort"
          :options="list"
          label-field="friendlyName"
          value-field="path"
          :loading="refreshLoading"
          :disabled="refreshLoading || isConnected"
          flex-1
        />
        <n-button
          :disabled="refreshLoading || isConnected"
          @click="refresh"
        >
          <div
            h-5
            w-5
            i-material-symbols-refresh-rounded
          />
        </n-button>
      </n-input-group>

      <n-button
        :type="isConnected ? 'error' : 'success'"
        @click="connectSwitch"
      >
        {{ isConnected ? '断开' : '连接' }}
      </n-button>
    </div>

    <div
      flex-1
      flex="~ col"
      gap-2
    >
      <div text="3.6 gray">
        <span>
          粘贴手机号、信息内容，点击
        </span> <span
          font-bold
          text-green
        >发送</span>
      </div>
      <n-input
        v-model:value="content"
        type="textarea"
        :resizable="false"
        placeholder=""
        w-full
        h-full
      />
    </div>

    <div
      flex
      justify-between
      items-center
    >
      <div
        flex
        items-center
        gap-4
      >
        <div
          w-30
          text="3.6 gray center"
        >
          发信手机号
        </div>
        <n-input-group>
          <n-input
            v-model:value="phone"
            :loading="getSenderLoading"
            :disabled="getSenderLoading || !isConnected"
            placeholder="请输入手机号"
          />
          <n-button
            :disabled="getSenderLoading || !isConnected"
            @click="getSenderPhoneNumber"
          >
            自动获取
          </n-button>
        </n-input-group>
      </div>
      <n-button
        :loading="sendLoading"
        :disabled="!isConnected"
        @click="send"
      >
        发送
      </n-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useStorage } from '@vueuse/core'
import { PortInfo } from '@smserialport/types'

const message = useMessage()

const isConnected = ref(false)
const refreshLoading = ref(false)
const sendLoading = ref(false)
const getSenderLoading = ref(false)

const selectedPort = ref()
const list = ref<PortInfo[]>([])

const content = useStorage('content', '')
const phone = useStorage('phone', '')

onMounted(() => {
  getSerialportList()
})


const connectSwitch = async () => {
  if (isConnected.value) {
    await closeSerialport()
    isConnected.value = false
    return
  }

  await window.electronAPI.config(selectedPort.value)
  isConnected.value = true
}

const getSerialportList = async () => {
  const serialportList = await window.electronAPI.getSerialportList();
  list.value = serialportList;
  selectedPort.value = serialportList[0].path;
}

const refresh = () => {
  if (refreshLoading.value) {
    return
  }

  refreshLoading.value = true

  getSerialportList().finally(() => {
    setTimeout(() => {
      refreshLoading.value = false
    }, 1000)
  })
}

const getSenderPhoneNumber = async () => {
  getSenderLoading.value = true

  const sender = await window.electronAPI.getSender().finally(() => {
    setTimeout(() => {
      getSenderLoading.value = false
    }, 1000)
  })

  if (!sender) {
    message.warning('SIM 没有保存手机号，请手动输入')
    return
  }

  phone.value = sender
}

const send = async () => {
  const messageList = content.value.split(/[\r\n]/).filter(text => text.trim() !== '')
  console.log('messageList', messageList)

  if (messageList.length === 0) {
    message.warning('消息不能为空')
    return
  }

  sendLoading.value = true

  try {
    for await (const content of messageList) {
      const [receiver, message] = content.split(/[\t]/)

      const success = await window.electronAPI.sendMessage({
        sender: phone.value,
        receiver: receiver,
        message: message
      })

      console.log(receiver, success)
    }
  } finally {
    sendLoading.value = false
  }
}

const closeSerialport = async () => window.electronAPI.close()
</script>
