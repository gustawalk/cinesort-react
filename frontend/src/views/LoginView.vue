<template>
  <div class="flex items-center justify-center min-h-screen bg-stone-900 font-sans">
    <Card class="w-full max-w-sm bg-stone-800 text-white border-stone-700 shadow-xl rounded-2xl">
      <CardHeader>
        <h2 class="text-2xl font-semibold text-center">Login</h2>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label for="user" class="block mb-2 text-stone-400">Username</label>
            <input id="user" type="text" v-model="username" placeholder="Username"
              class="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label for="password" class="block mb-2 text-stone-400">Password</label>
            <input id="password" type="password" v-model="password" placeholder="Password"
              class="w-full px-3 py-2 rounded-lg bg-stone-700 text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <p v-if="errorMessage" class="text-red-500 text-center text-sm">
            {{ errorMessage }}
          </p>

          <Button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 font-semibold">
            Login
          </Button>
        </form>
      </CardContent>

      <CardFooter class="flex justify-center mt-2">
        <p class="text-stone-400 text-sm">
          Don't have an account?
          <a href="register" class="text-blue-500 hover:underline">Register</a>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const router = useRouter();

const username = ref('');
const password = ref('');
const errorMessage = ref('');

const handleErrors = (): boolean => {
  errorMessage.value = '';

  if (!username.value) {
    errorMessage.value = 'Username is required!';
    return false;
  }

  if (!password.value) {
    errorMessage.value = 'Password is required!';
    return false;
  }

  return true;
}

const handleLogin = async () => {
  if(!handleErrors()){
    return;
  }

  let response = await fetch("http://localhost:6700/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({user: username.value, password: password.value})
  });

  let data = await response.json();

  if(response.status != 200){
    errorMessage.value = 'Username or password are incorrect!'
    return;
  }
  localStorage.setItem('token', data.token)
  localStorage.setItem('user', JSON.stringify(data.user))

  router.push('/');
};
</script>
