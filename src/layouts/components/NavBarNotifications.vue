<script lang="ts" setup>
import type { Notification } from '@/types/layouts'

import avatar4 from '@assets/avatars/avatar-4.png'
import avatar5 from '@assets/avatars/avatar-5.png'

const notifications = ref<Notification[]>([
  {
    id: 1,
    img: avatar4,
    title: 'Congratulation Flora! 🎉',
    subtitle: 'Won the monthly best seller badge',
    time: 'Today',
    isSeen: true,
  },
  {
    id: 2,
    text: 'Cecilia Becker',
    title: 'Cecilia Becker',
    subtitle: 'Accepted your connection',
    time: '12h ago',
    isSeen: false,
    color: 'primary',
  },
  {
    id: 3,
    img: avatar5,
    title: 'New message received 👋🏻',
    subtitle: 'You have 10 unread messages',
    time: '11 Aug',
    isSeen: true,
  },
  {
    id: 4,
    icon: 'ri-bar-chart-line',
    title: 'Monthly report generated',
    subtitle: 'July month financial report is generated',
    time: 'Apr 24, 10:30 AM',
    isSeen: false,
    color: 'info',
  },
  {
    id: 5,
    text: 'Meta Gadgets',
    title: 'Application has been approved 🚀',
    subtitle: 'Your Meta Gadgets project application has been approved.',
    time: 'Feb 17, 12:17 PM',
    isSeen: false,
    color: 'success',
  },
  {
    id: 6,
    icon: 'ri-mail-line',
    title: 'New message from Harry',
    subtitle: 'You have new message from Harry',
    time: 'Jan 6, 1:48 PM',
    isSeen: true,
    color: 'error',
  },
])

const removeNotification = (notificationId: number) => {
  notifications.value.forEach((item: any, index: any) => {
    if (notificationId === item.id)
      notifications.value.splice(index, 1)
  })
}

const markRead = (notificationId: number[]) => {
  notifications.value.forEach((item: any) => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = true
    })
  })
}

const markUnRead = (notificationId: number[]) => {
  notifications.value.forEach((item: any) => {
    notificationId.forEach(id => {
      if (id === item.id)
        item.isSeen = false
    })
  })
}

const handleNotificationClick = (notification: Notification) => {
  if (!notification.isSeen)
    markRead([notification.id])
}
</script>

<template>
  <Notifications
    :notifications="notifications"
    @remove="removeNotification"
    @read="markRead"
    @unread="markUnRead"
    @click:notification="handleNotificationClick"
  />
</template>
