# Venturr Labor Pricing - Data Structures and Integration Architecture

## 1. Executive Summary

This document outlines the data structures, calculator logic, UI/UX design, and integration architecture for the enhanced labor pricing module in the Venturr platform. The goal is to create a comprehensive and accurate labor costing system for the Australian roofing industry, with a specific focus on Colorbond metal roofing on the East Coast.

## 2. Data Schema and Structures

To support the new labor pricing features, the following data structures will be implemented:

### 2.1. Skill Levels

A new table `SkillLevel` will be created to store the different labor skill levels and their corresponding base hourly rates.

| Field Name | Data Type | Description |
|---|---|---|
| `id` | `INTEGER` | Primary Key |
| `name` | `TEXT` | Name of the skill level (e.g., 'Apprentice', 'Tradesperson', 'Supervisor') |
| `base_rate` | `DECIMAL` | The base hourly wage for this skill level |

### 2.2. Regional Adjustments

A new table `RegionalAdjustment` will store the percentage-based adjustments for different regions.

| Field Name | Data Type | Description |
|---|---|---|
| `id` | `INTEGER` | Primary Key |
| `region` | `TEXT` | The region name (e.g., 'Sydney Metro', 'Regional NSW') |
| `adjustment_percentage` | `DECIMAL` | The percentage to adjust the base rate by for this region |

### 2.3. Crew Compositions

A new table `CrewComposition` will define standard crew configurations.

| Field Name | Data Type | Description |
|---|---|---|
| `id` | `INTEGER` | Primary Key |
| `name` | `TEXT` | The name of the crew composition (e.g., 'Standard Crew', 'Large Crew') |
| `description` | `TEXT` | A brief description of the crew composition |

### 2.4. Crew Composition Skill Levels (Junction Table)

A junction table `CrewCompositionSkillLevel` will link crew compositions to skill levels and specify the number of workers of each skill level in the crew.

| Field Name | Data Type | Description |
|---|---|---|
| `crew_composition_id` | `INTEGER` | Foreign Key to `CrewComposition` |
| `skill_level_id` | `INTEGER` | Foreign Key to `SkillLevel` |
| `quantity` | `INTEGER` | The number of workers of this skill level in the crew |

### 2.5. On-Costs

A new table `OnCost` will store the various on-costs associated with labor.

| Field Name | Data Type | Description |
|---|---|---|
| `id` | `INTEGER` | Primary Key |
| `name` | `TEXT` | The name of the on-cost (e.g., 'Superannuation', 'WorkCover NSW') |
| `rate` | `DECIMAL` | The percentage rate for the on-cost |
| `type` | `TEXT` | The type of on-cost (e.g., 'percentage', 'fixed') |

## 3. Calculator Logic

The roofing takeoff calculator will be updated to incorporate the new labor pricing logic.

### 3.1. Total Labor Hours Calculation

The total labor hours will be calculated based on the roof area and complexity.

`Total Labor Hours = Roof Area * Base Labor Hours per m² * Complexity Multiplier`

### 3.2. Total Labor Cost Calculation

The total labor cost will be calculated by first determining the total hourly rate for the selected crew, including all on-costs, and then multiplying by the total labor hours.

`Total Crew Hourly Rate = Σ (Skill Level Base Rate * (1 + Regional Adjustment) * Quantity) for each skill level in the crew`

`Total Labor Cost = Total Crew Hourly Rate * Total Labor Hours * (1 + Σ On-Cost Rates)`

## 4. UI/UX Design

The calculator interface will be updated to allow users to configure the labor pricing.

### 4.1. Crew Selection

A new dropdown menu will be added to the calculator to allow users to select a crew composition.

### 4.2. Skill Level Configuration

For each crew composition, the user will be able to see the breakdown of skill levels and their corresponding rates.

### 4.3. On-Cost Display

The calculator will display a detailed breakdown of all on-costs, including superannuation and WorkCover.

## 5. Integration Architecture

The new labor pricing module will be integrated with the existing Venturr platform components.

### 5.1. Calculator Integration

The calculator will fetch the labor pricing data from the new tables and use the new logic to calculate the total labor cost.

### 5.2. Quote Generator Integration

The quote generator will be updated to include a detailed breakdown of the labor costs in the generated PDF.

### 5.3. Dual-Intelligence System Integration

The Dual-Intelligence system will be trained on the new labor pricing data to provide more accurate estimates and recommendations. The knowledge base will be updated to include the new data structures and relationships.

