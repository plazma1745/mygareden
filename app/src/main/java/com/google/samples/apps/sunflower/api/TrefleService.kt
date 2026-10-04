/*
 * Copyright 2026
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.google.samples.apps.sunflower.api

import com.google.samples.apps.sunflower.BuildConfig
import com.google.samples.apps.sunflower.data.TrefleSearchResponse
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import okhttp3.logging.HttpLoggingInterceptor.Level
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * Used to connect to the Trefle API (https://trefle.io), an open plant database.
 *
 * A free API token is required — register at https://trefle.io/users/sign_up and put
 * the token into gradle.properties as `trefle_token` (same mechanism as the Unsplash key).
 * The token is sent as the `token` query parameter with every request.
 */
interface TrefleService {

    @GET("api/v1/species/search")
    suspend fun searchPlants(
        @Query("q") query: String,
        @Query("page") page: Int,
        @Query("token") token: String = BuildConfig.TREFLE_TOKEN
    ): TrefleSearchResponse

    companion object {
        private const val BASE_URL = "https://trefle.io/"
        const val PER_PAGE = 15

        fun create(): TrefleService {
            val logger = HttpLoggingInterceptor().apply { level = Level.BASIC }

            val client = OkHttpClient.Builder()
                .addInterceptor(logger)
                .build()

            return Retrofit.Builder()
                .baseUrl(BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(TrefleService::class.java)
        }
    }
}
