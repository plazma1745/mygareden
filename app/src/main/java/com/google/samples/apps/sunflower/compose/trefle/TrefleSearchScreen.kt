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

package com.google.samples.apps.sunflower.compose.trefle

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.dimensionResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.bumptech.glide.integration.compose.ExperimentalGlideComposeApi
import com.bumptech.glide.integration.compose.GlideImage
import com.google.samples.apps.sunflower.R
import com.google.samples.apps.sunflower.data.Plant
import com.google.samples.apps.sunflower.viewmodels.TrefleSearchViewModel

/**
 * Screen that lets the user search the Trefle plant database (https://trefle.io)
 * and add the found plants to their local catalog / garden.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TrefleSearchScreen(
    onUpClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: TrefleSearchViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    Scaffold(
        modifier = modifier,
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.trefle_search_title)) },
                navigationIcon = {
                    IconButton(onClick = onUpClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.a11y_back)
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = MaterialTheme.colorScheme.primary
                )
            )
        }
    ) { contentPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(contentPadding)
                .padding(horizontal = dimensionResource(R.dimen.margin_normal))
        ) {
            SearchField(
                query = uiState.query,
                isSearching = uiState.isSearching,
                onQueryChanged = viewModel::onQueryChanged,
                onSearchClick = viewModel::search,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = dimensionResource(R.dimen.margin_small))
            )

            when {
                uiState.isSearching -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator()
                    }
                }

                uiState.error != null -> {
                    Text(
                        text = stringResource(R.string.trefle_search_error, uiState.error!!),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier.padding(top = dimensionResource(R.dimen.margin_small))
                    )
                }

                uiState.results.isEmpty() -> {
                    Text(
                        text = stringResource(R.string.trefle_search_hint),
                        style = MaterialTheme.typography.bodyMedium,
                        textAlign = TextAlign.Center,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = dimensionResource(R.dimen.padding_large))
                    )
                }

                else -> {
                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(dimensionResource(R.dimen.margin_small))
                    ) {
                        items(items = uiState.results, key = { it.plantId }) { plant ->
                            TrefleResultItem(
                                plant = plant,
                                isSaved = plant.plantId in uiState.savedPlantIds,
                                onSaveClick = { viewModel.savePlant(plant) }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SearchField(
    query: String,
    isSearching: Boolean,
    onQueryChanged: (String) -> Unit,
    onSearchClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChanged,
            label = { Text(stringResource(R.string.trefle_search_field_label)) },
            singleLine = true,
            modifier = Modifier.weight(1f)
        )
        Button(
            onClick = onSearchClick,
            enabled = !isSearching && query.isNotBlank(),
            modifier = Modifier.padding(start = dimensionResource(R.dimen.margin_small))
        ) {
            Icon(Icons.Filled.Search, contentDescription = null)
        }
    }
}

@Composable
private fun TrefleResultItem(
    plant: Plant,
    isSaved: Boolean,
    onSaveClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        @OptIn(ExperimentalGlideComposeApi::class)
        GlideImage(
            model = plant.imageUrl,
            contentDescription = stringResource(R.string.a11y_plant_item_image),
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .size(64.dp)
                .clip(RoundedCornerShape(dimensionResource(R.dimen.card_corner_radius)))
        )
        Column(
            modifier = Modifier
                .weight(1f)
                .padding(horizontal = dimensionResource(R.dimen.margin_small))
        ) {
            Text(text = plant.name, style = MaterialTheme.typography.titleMedium)
            Text(
                text = plant.description,
                style = MaterialTheme.typography.bodySmall,
                maxLines = 2
            )
        }
        Button(
            onClick = onSaveClick,
            enabled = !isSaved,
            modifier = Modifier.height(40.dp)
        ) {
            Text(
                text = stringResource(
                    if (isSaved) R.string.trefle_added else R.string.trefle_add
                )
            )
        }
    }
}
