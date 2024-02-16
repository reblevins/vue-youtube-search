<template>
<h1>YouTube Search App</h1>
<input id="search_term" v-model="searchTerm" @keyup.enter="handleClickSearch">
<button @click="handleClickSearch">Search</button>
<button @click="handleClickClear">Clear</button>

<select v-model="orderBy">
  <option value="date">Date</option>
  <option value="rating">Rating</option>
  <option value="relevance">Relevance</option>
</select>
<div v-if="loading" class="loading">Searching...</div>
<table v-else cellpadding="0" cellspacing="0">
  <thead>
    <tr>
      <th></th>
      <th>Title</th>
      <th>Description</th>
      <th># of comments</th>
    </tr>
  </thead>
  <tbody>
    <template v-if="videos.length === 0 && noResults">
      <tr class="no-videos">
        <td colspan="4"><div>There were no results for your search. Please try again.</div></td>
      </tr>
    </template>
    <template v-else-if="videos.length === 0">
      <tr class="no-videos">
        <td colspan="4"><div>Videos will show here once you have searched for something.</div></td>
      </tr>
    </template>
    <TableRow v-else v-bind="video" v-for="video in mappedVideos" :key="video" />
  </tbody>
</table>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'

import TableRow from './components/TableRow.vue'

const loggedIn = ref(false)
const appAuthorized = ref(true)
const searchTerm = ref('')
const loading = ref(false)
const noResults = ref(false)
const videos = ref([])
const orderBy = ref('date')

onMounted(() => {
  // Set the api key and load the GAPI client
  gapi.client.setApiKey(import.meta.env.VITE_GOOGLE_API_KEY)
  return gapi.client.load("https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest")
    .then(function() { console.log("GAPI client loaded") },
      function(err) { console.error("Error loading GAPI client for API", err) })
})

// Watch the videos array and once it is populated, iterate over them fetching comment counts
// for each video. That gets saved to the comments property of the video which then reactively
// populates in the view.
watch(videos, () => {
  if (videos.value.length > 0) {
    videos.value.forEach((video, index) => {
      window.gapi.client.youtube.commentThreads.list({
        "part": "replies",
        "videoId": video.id.videoId,
        "maxResults": 100,
      }).then(response => {
        videos.value[index].comments = response.result.pageInfo.totalResults
      },
        function (err) {
          // If there was an error it is most likely a 403 "commentsDisabled" error meaning that the video
          // in question has disabled comments.
          console.error("Execute error", err)
        })
    })
  }
})

// Watch the value for the sorting dropdown and once it has changed, call search again.
watch(orderBy, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleClickSearch()
  }
})

const mappedVideos = computed(() => {
  if (videos.value.length === 0) return []

  const mappedVideos = videos.value

  return mappedVideos.map(video => {
    return {
      thumbnail: video.snippet.thumbnails.default.url,
      videoId: video.id.videoId,
      title: video.snippet.title,
      description: video.snippet.description,
      comments: video.comments,
    }
  })
})

async function handleClickSearch() {
  if (!searchTerm.value) return
  loading.value = true
  noResults.value = false

  try {
    const response = await window.gapi.client.youtube.search.list({
      "part": [
        "snippet",
      ],
      "order": orderBy.value,
      "type": "video",
      "maxResults": 10,
      "q": searchTerm.value,
    })
    videos.value = response.result.items
    if (videos.value.length === 0) noResults.value = true
  } catch(error) {
    console.log(error)
  }
  loading.value = false
}

function handleClickClear() {
  searchTerm.value = ''
  noResults.value = false
  videos.value = []
}
</script>

<style lang="scss">
* {
  font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}
body {
  font-size: 18px;
}
.loading {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50vh;
  font-size: 1.5em;
}
input, button, select {
  padding: 0.5em;
  margin-right: 0.5em;
  margin-bottom: 2em;
  font-size: 0.9em;
}
table {
  width: 100%;

  tbody tr {
    &:hover:not(.no-videos) {
      background-color: cornsilk;
    }
    &.no-videos {
      text-align: center;
      
      &:hover {
        background-color: initial;
      }
      div {
        min-height: 113px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
  th {
    padding: 1em 0.5em;
  }
  td {
    padding: 0.2em 0.5em;
  }
  th, td {
    border-bottom: 1px solid cornflowerblue;

    &:first-child {
      padding-left: 0;
    }
    &:last-child {
      padding-right: 0;
      text-align: center;
      min-width: 200px;
    }
  }
}
</style>