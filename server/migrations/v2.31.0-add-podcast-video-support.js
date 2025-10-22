/**
 * @typedef MigrationContext
 * @property {import('sequelize').QueryInterface} queryInterface - a Sequelize QueryInterface object.
 * @property {import('../Logger')} logger - a Logger object.
 *
 * @typedef MigrationOptions
 * @property {MigrationContext} context - an object containing the migration context.
 */

const migrationVersion = '2.31.0'
const migrationName = `${migrationVersion}-add-podcast-video-support`
const loggerPrefix = `[${migrationVersion} migration]`

/**
 * This migration adds videoURL and videoType columns to the podcastEpisodes table
 * to support video podcast episodes.
 *
 * @param {MigrationOptions} options - an object containing the migration context.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
async function up({ context: { queryInterface, logger } }) {
  logger.info(`${loggerPrefix} UPGRADE BEGIN: ${migrationName}`)

  if (await queryInterface.tableExists('podcastEpisodes')) {
    const tableDescription = await queryInterface.describeTable('podcastEpisodes')
    
    if (!tableDescription.videoURL) {
      logger.info(`${loggerPrefix} Adding videoURL column to podcastEpisodes table`)
      await queryInterface.addColumn('podcastEpisodes', 'videoURL', {
        type: queryInterface.sequelize.Sequelize.DataTypes.STRING,
        allowNull: true
      })
      logger.info(`${loggerPrefix} Added videoURL column to podcastEpisodes table`)
    } else {
      logger.info(`${loggerPrefix} videoURL column already exists in podcastEpisodes table`)
    }

    if (!tableDescription.videoType) {
      logger.info(`${loggerPrefix} Adding videoType column to podcastEpisodes table`)
      await queryInterface.addColumn('podcastEpisodes', 'videoType', {
        type: queryInterface.sequelize.Sequelize.DataTypes.STRING,
        allowNull: true
      })
      logger.info(`${loggerPrefix} Added videoType column to podcastEpisodes table`)
    } else {
      logger.info(`${loggerPrefix} videoType column already exists in podcastEpisodes table`)
    }
  } else {
    logger.info(`${loggerPrefix} podcastEpisodes table does not exist`)
  }

  logger.info(`${loggerPrefix} UPGRADE END: ${migrationName}`)
}

/**
 * This migration removes videoURL and videoType columns from the podcastEpisodes table.
 *
 * @param {MigrationOptions} options - an object containing the migration context.
 * @returns {Promise<void>} - A promise that resolves when the migration is complete.
 */
async function down({ context: { queryInterface, logger } }) {
  logger.info(`${loggerPrefix} DOWNGRADE BEGIN: ${migrationName}`)

  if (await queryInterface.tableExists('podcastEpisodes')) {
    const tableDescription = await queryInterface.describeTable('podcastEpisodes')
    
    if (tableDescription.videoType) {
      logger.info(`${loggerPrefix} Removing videoType column from podcastEpisodes table`)
      await queryInterface.removeColumn('podcastEpisodes', 'videoType')
      logger.info(`${loggerPrefix} Removed videoType column from podcastEpisodes table`)
    } else {
      logger.info(`${loggerPrefix} videoType column does not exist in podcastEpisodes table`)
    }

    if (tableDescription.videoURL) {
      logger.info(`${loggerPrefix} Removing videoURL column from podcastEpisodes table`)
      await queryInterface.removeColumn('podcastEpisodes', 'videoURL')
      logger.info(`${loggerPrefix} Removed videoURL column from podcastEpisodes table`)
    } else {
      logger.info(`${loggerPrefix} videoURL column does not exist in podcastEpisodes table`)
    }
  } else {
    logger.info(`${loggerPrefix} podcastEpisodes table does not exist`)
  }

  logger.info(`${loggerPrefix} DOWNGRADE END: ${migrationName}`)
}

module.exports = { up, down }
