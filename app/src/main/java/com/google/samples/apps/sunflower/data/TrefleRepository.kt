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

import com.google.samples.apps.sunflower.api.TrefleService
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository that searches the Trefle API (https://trefle.io) and converts
 * remote results into local [Plant] entities that can be saved to the database
 * and added to the user's garden.
 */
@Singleton
class TrefleRepository @Inject constructor(
    private val trefleService: TrefleService,
    private val plantRepository: PlantRepository
) {

    /**
     * Searches Trefle for species matching [query].
     */
    suspend fun searchPlants(query: String, page: Int = 1): List<Plant> {
        val response = trefleService.searchPlants(query = query, page = page)
        return response.data.mapNotNull(::toPlant)
    }

    /**
     * Saves a plant found via Trefle to the local database so it shows up
     * in the plant list and can be added to the garden.
     */
    suspend fun savePlant(plant: Plant) {
        plantRepository.upsertPlant(plant)
    }

    private fun toPlant(remote: TreflePlant): Plant? {
        // A plant needs at least one usable name to be displayed.
        val name = remote.commonName?.takeIf { it.isNotBlank() }
            ?: remote.scientificName?.takeIf { it.isNotBlank() }
            ?: return null

        val imageUrl = remote.mainImage?.originalUrl?.takeIf { it.isNotBlank() }
            ?: remote.images?.firstOrNull { !it.originalUrl.isNullOrBlank() }?.originalUrl
            .orEmpty()

        return Plant(
            plantId = "$ID_PREFIX${remote.slug ?: remote.id}",
            name = name,
            description = buildString {
                remote.scientificName
                    ?.takeIf { it.isNotBlank() && it != name }
                    ?.let { append(it).append(". ") }
                remote.familyCommonName
                    ?.takeIf { it.isNotBlank() }
                    ?.let { append("Family: ").append(it).append(". ") }
                append("Found via Trefle (trefle.io).")
            },
            growZoneNumber = DEFAULT_GROW_ZONE,
            wateringInterval = DEFAULT_WATERING_INTERVAL,
            imageUrl = imageUrl
        )
    }

    companion object {
        const val ID_PREFIX = "trefle_"
        private const val DEFAULT_GROW_ZONE = 9
        private const val DEFAULT_WATERING_INTERVAL = 7
    }
}
