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

package com.google.samples.apps.sunflower.data

import com.google.gson.annotations.SerializedName

/**
 * Response models for the Trefle API (https://trefle.io).
 *
 * Example request:
 *   GET https://trefle.io/api/v1/species/search?q=monstera&token=<TOKEN>
 *
 * Docs: https://docs.trefle.io/reference/?shell#search-species
 */
data class TrefleSearchResponse(
    val data: List<TreflePlant> = emptyList(),
    val meta: TrefleMeta? = null
)

data class TrefleMeta(
    @SerializedName("current_page") val currentPage: Int = 1,
    @SerializedName("total_pages") val totalPages: Int = 1,
    val total: Int = 0
)

data class TreflePlant(
    val id: Long,
    val slug: String? = null,
    @SerializedName("common_name") val commonName: String? = null,
    @SerializedName("scientific_name") val scientificName: String? = null,
    val familyCommonName: String? = null,
    @SerializedName("main_image") val mainImage: TrefleImage? = null,
    val images: List<TrefleImage>? = null
)

data class TrefleImage(
    @SerializedName("original_url") val originalUrl: String? = null
)
