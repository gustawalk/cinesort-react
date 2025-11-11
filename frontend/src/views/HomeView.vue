<template>
  <div class="min-h-screen bg-stone-900 text-white font-sans flex flex-col">
    <div class="p-4">
      <Button variant="secondary" class="bg-stone-700 text-white hover:bg-stone-600"
        @click="handleLogout">
        Logout
      </Button>
    </div>

    <div class="flex flex-1 justify-center items-center relative">
      <Card class="absolute bg-stone-800 border-stone-700 rounded-xl shadow-lg w-full max-w-lg text-center">
        <CardHeader>
          <h2 class="text-white text-xl font-semibold">Search for a Movie</h2>
        </CardHeader>
        <CardContent>
          <div class="flex space-x-2">
            <input type="text" v-model="searchTerm" placeholder="Enter movie name"
              class="flex-1 px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Button class="bg-blue-600 hover:bg-blue-700" @click="handleSearch">Search</Button>
            <Button variant="secondary" class="text-white bg-blue-600 hover:bg-blue-700"
              @click="handleRandom">Random</Button>
          </div>

          <div v-if="results.length" class="mt-4 text-left">
            <ul class="space-y-1">
              <li v-for="(movie, i) in results" :key="i" class="text-stone-400">
                <!-- TODO: here i will show the query's result -->
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div class="absolute right-60 flex flex-col space-y-6">
        <Card class="bg-stone-800 border-stone-700 rounded-xl w-96 shadow-lg">
          <CardHeader>
            <div class="flex text-white items-center space-x-2">
              <span class="text-xl">ⓘ</span>
              <h3 class="font-semibold">User Lists</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div class="flex items-center space-x-3 mb-4">
              <select v-model="selectedList" class="flex-1 px-3 py-2 rounded-lg bg-stone-700 text-white outline-none">
                  <option
                    v-for="list in userLists"
                    :key="list.id"
                    :value="list.id"
                  >
                    {{ list.nome_lista }}
                  </option>
                </select>
              <Button class="bg-blue-600 hover:bg-blue-700 px-4"
                :onclick="handleCreate"
              >
                Create
              </Button>
            </div>
            <div class="flex justify-between space-x-3">
                <Button
                  :onclick="handleDraw"
                  :disabled="buttonsDisabled"
                  class="bg-green-600 hover:bg-green-700 w-24 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Draw
                </Button>

                <Button
                  :disabled="buttonsDisabled"
                  class="bg-yellow-500 hover:bg-yellow-600 w-24 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit
                </Button>

                <Button
                  :disabled="buttonsDisabled"
                  class="bg-red-600 hover:bg-red-700 w-24 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete
                </Button>
              </div>
          </CardContent>
        </Card>

        <Card class="bg-stone-800 border-stone-700 rounded-xl w-96 shadow-lg">
          <CardHeader>
            <div class="flex text-white items-center space-x-2">
              <span class="text-xl">ⓘ</span>
              <h3 class="font-semibold">User Statistics</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div class="space-y-3 text-md font-bold">
              <div class="flex justify-between">
                <span class="text-stone-400">Last Movie</span>
                <span class="text-blue-400">{{ userStats.lastMovie }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-400">Watched Movies</span>
                <span class="text-blue-400">{{ userStats.watchedMovies }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-400">Highest Rated</span>
                <span class="text-blue-400">{{ userStats.highestRated }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-stone-400">Lowest Rated</span>
                <span class="text-blue-400">{{ userStats.lowestRated }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { decodeJwt } from 'jose'
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { UserStats } from '@/types/userStats';
import Swal from "sweetalert2";

const router = useRouter();

const searchTerm = ref('')
const results = ref<string[]>([])

const user = ref<any>(null)

const buttonsDisabled = ref(true)

const userLists = ref<{ id: number; nome_lista: string }[]>([])
const selectedList = ref<number | null>(null)

const userStats = reactive<UserStats>({
  lastMovie: '<placeholder>',
  watchedMovies: 0,
  highestRated: '<placeholder>',
  lowestRated: '<placeholder>'
})

const getUserFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const decoded = decodeJwt(token)
    return decoded
  } catch (err) {
    console.error('Invalid token:', err)
    return null
  }
}

const getUserStats = async () => {
  // TODO: fetch the data from backend
}

const getUserPendency = async () => {
  // TODO: check if user has some pendency
}

const getUserLists = async () => {
  try {
    const token = localStorage.getItem('token')

    if (!token) {
      router.replace('/login') // substitui a URL atual
      return
    }

    user.value = getUserFromToken();

    if(!user.value){
      localStorage.removeItem('token')
      router.replace('/login')
      return
    }

    const response = await fetch("/api/userLists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token')
      router.replace('/login')
      return
    }

    const data = await response.json()

    if (!response.ok) {
      return
    }


    userLists.value = data.user_lists.map((l: any) => ({
      id: l.id,
      nome_lista: l.nome_lista
    }))

    buttonsDisabled.value = false;

    if (userLists.value.length == 0) {
      userLists.value = [
        {
          id: -1,
          nome_lista: "No lists found"
        }
      ];

      buttonsDisabled.value = true;
    }
    selectedList.value = userLists.value[0].id
  } catch (err) {
    console.error(err)
    router.replace('/login')
  }
}

const handleCreate = async () => {
  const newListModal = await Swal.fire({
    title: "Create a new list",
    input: "text",
    inputPlaceholder: "Enter your list name",
    showCancelButton: true,
    confirmButtonText: "Create",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#2563eb",
    cancelButtonColor: "#d33",
    background: "#1c1917",
    color: "#ffffff",
    inputAttributes: {
      maxlength: 50,
      autocapitalize: "off",
      autocorrect: "off"
    }
  });

  if(!newListModal.isConfirmed || newListModal.value == "") {
    return;
  }

  console.log(newListModal);
}

const handleDraw = () => {
  // TODO: handle draw by getting the selectedList.value and checking if it belongs to user
  if(buttonsDisabled.value == true){ return }

  console.log("Drawing a movie")
}

const handleSearch = () => {
  // TODO: handle the search to return a list from api
}

const handleRandom = () => {
  // TODO: handle random search
}

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  router.push('/login');
}

getUserLists();
</script>
