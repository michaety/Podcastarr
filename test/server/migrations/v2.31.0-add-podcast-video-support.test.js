const { expect } = require('chai')
const sinon = require('sinon')
const { up, down } = require('../../../server/migrations/v2.31.0-add-podcast-video-support')
const { Sequelize } = require('sequelize')
const Logger = require('../../../server/Logger')

describe('v2.31.0-add-podcast-video-support', () => {
  let sequelize
  let queryInterface
  let loggerInfoStub

  beforeEach(async () => {
    sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false })
    queryInterface = sequelize.getQueryInterface()
    loggerInfoStub = sinon.stub(Logger, 'info')

    // Create the podcastEpisodes table
    await queryInterface.createTable('podcastEpisodes', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    })
  })

  afterEach(() => {
    sinon.restore()
  })

  describe('up', () => {
    it('should add videoURL and videoType columns to podcastEpisodes table', async () => {
      await up({ context: { queryInterface, logger: Logger } })

      const tableDescription = await queryInterface.describeTable('podcastEpisodes')
      expect(tableDescription).to.have.property('videoURL')
      expect(tableDescription).to.have.property('videoType')
      expect(tableDescription.videoURL.allowNull).to.be.true
      expect(tableDescription.videoType.allowNull).to.be.true
    })

    it('should not fail if columns already exist', async () => {
      await up({ context: { queryInterface, logger: Logger } })
      // Run migration again
      await up({ context: { queryInterface, logger: Logger } })

      const tableDescription = await queryInterface.describeTable('podcastEpisodes')
      expect(tableDescription).to.have.property('videoURL')
      expect(tableDescription).to.have.property('videoType')
    })
  })

  describe('down', () => {
    it('should remove videoURL and videoType columns from podcastEpisodes table', async () => {
      await up({ context: { queryInterface, logger: Logger } })
      await down({ context: { queryInterface, logger: Logger } })

      const tableDescription = await queryInterface.describeTable('podcastEpisodes')
      expect(tableDescription).not.to.have.property('videoURL')
      expect(tableDescription).not.to.have.property('videoType')
    })

    it('should not fail if columns do not exist', async () => {
      await down({ context: { queryInterface, logger: Logger } })

      const tableDescription = await queryInterface.describeTable('podcastEpisodes')
      expect(tableDescription).not.to.have.property('videoURL')
      expect(tableDescription).not.to.have.property('videoType')
    })
  })
})
