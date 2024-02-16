<template>
<GoogleLogin :callback="callback" v-if="!gapiClientLoaded"/>

<div v-else>
  <input id="search_term" v-model="searchTerm">
  <button @click="handleClickSearch">Search</button>
  
  <select v-model="sortBy">
    <option value="date">Date</option>
    <option value="rating">Rating</option>
    <option value="relevance">Relevance</option>
  </select>
  <table>
      <table v-if="videos.length > 0">
        <thead>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Description</th>
            <th># of comments</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="video in sortedVideos" :key="video">
            <td><img :src="video.thumbnail" /></td>
            <td>{{ video.title }}</td>
            <td>{{ video.description }}</td>
            <td>{{ video.comments || "No comments" }}</td>
          </tr>
        </tbody>
      </table>

      <p v-else>No videos to show!</p>
  </table>
</div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const loggedIn = ref(false)
const gapiClientLoaded = ref(false)
const searchTerm = ref('dog')
const videos = ref([])
const sortBy = ref('date')

const callback = (response) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  console.log("Handle the response", response)
  loggedIn.value = true
}

watch(loggedIn, (value) => {
  console.log(value)
  if (value === true) {
    window.gapi.client.setApiKey("AIzaSyCwnzmEgvN2kzf-Y9KDX13YVQsd-VVLLZ8");
    return window.gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
      .then(function () { gapiClientLoaded.value = true },
        function (err) { console.error("Error loading GAPI client for API", err); })
  }
})

watch(videos, () => {
  if (videos.value.length > 0) {
    videos.value.forEach((video, index) => {
      window.gapi.client.youtube.commentThreads.list({
        "part": "replies",
        "videoId": video.id.videoId,
        "maxResults": 100,
      }).then(response => {
        console.log(response.result.pageInfo.totalResults)
        videos.value[index].comments = response.result.pageInfo.totalResults
      },
        function (err) {
          console.error("Execute error", err)
        })
    })
  }
})

watch(sortBy, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleClickSearch()
  }
})

const sortedVideos = computed(() => {
  if (videos.value.length === 0) return []

  return videos.value.map(video => {
    return {
      thumbnail: video.snippet.thumbnails.default.url,
      title: video.snippet.title,
      description: video.snippet.description,
      comments: video.comments,
    }
  })
})

async function handleClickSearch() {
  if (!searchTerm.value) return

  const response = await window.gapi.client.youtube.search.list({
    "part": [
      "snippet",
    ],
    "order": sortBy.value,
    "type": "video",
    "maxResults": 10,
    "q": searchTerm.value,
  })
  videos.value = response.result.items
  console.log(videos.value)
}


</script>

