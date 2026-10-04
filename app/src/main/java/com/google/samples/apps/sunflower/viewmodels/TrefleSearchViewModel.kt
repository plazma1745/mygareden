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

package com.google.samples.apps.sunflower.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.google.samples.apps.sunflower.data.Plant
import com.google.samples.apps.sunflower.data.TrefleRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

/**
 * UI state for the [TrefleSearchViewModel].
 */
data class TrefleUiState(
    val query: String = "",
    val isSearching: Boolean = false,
    val results: List<Plant> = emptyList(),
    val error: String? = null,
    val savedPlantIds: Set<String> = emptySet()
)

@HiltViewModel
class TrefleSearchViewModel @Inject constructor(
    private val trefleRepository: TrefleRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(TrefleUiState())
    val uiState: StateFlow<TrefleUiState> = _uiState.asStateFlow()

    fun onQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(query = query)
    }

    fun search() {
        val query = _uiState.value.query.trim()
        if (query.isEmpty()) return

        _uiState.value = _uiState.value.copy(isSearching = true, error = null)
        viewModelScope.launch {
            try {
                val results = trefleRepository.searchPlants(query)
                _uiState.value = _uiState.value.copy(
                    isSearching = false,
                    results = results,
                    error = null
                )
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isSearching = false,
                    results = emptyList(),
                    error = e.localizedMessage ?: "Unknown error"
                )
            }
        }
    }

    /**
     * Saves the plant found via Trefle to the local database, so it appears
     * in the plant list and can be added to the garden.
     */
    fun savePlant(plant: Plant) {
        viewModelScope.launch {
            trefleRepository.savePlant(plant)
            _uiState.value = _uiState.value.copy(
                savedPlantIds = _uiState.value.savedPlantIds + plant.plantId
            )
        }
    }

    fun clearResults() {
        _uiState.value = TrefleUiState()
    }
}
